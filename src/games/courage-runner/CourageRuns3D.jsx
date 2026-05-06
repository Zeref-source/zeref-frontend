import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * COURAGE RUNS 3D v2 - RealityDive Edition
 * -----------------------------------------
 */

export default function CourageRuns3D() {
    const mountRef = useRef(null);
    const frameIdRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let width = mount.clientWidth || window.innerWidth;
        let height = mount.clientHeight || window.innerHeight;

        // --- 1. CONFIG ---
        const CFG = {
            LANES: [-3.2, 0, 3.2],
            BASE_SPEED: 0.5,
            SPEED_INC: 0.0001,
            GRAVITY: -28,
            JUMP_FORCE: 10.5,
            LIVES: 3,
            COLORS: {
                PINK: 0xFF69B4,
                DARK_PINK: 0xD81B60,
                GROUND: 0x1a1208,
                FOG: 0x1a0030
            }
        };

        // --- 2. TEXTURE FACTORY ---
        const TF = {
            generate() {
                this.ground = this.cGround();
                this.katz = this.cKatz();
            },
            cGround() {
                const c = document.createElement('canvas'); c.width = c.height = 512;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#1a1208'; ctx.fillRect(0,0,512,512);
                for(let i=0; i<1000; i++) {
                    ctx.fillStyle = `rgba(35,21,8,${Math.random()*0.3})`;
                    ctx.fillRect(Math.random()*512, Math.random()*512, 4, 4);
                }
                const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(8, 2); return tex;
            },
            cKatz() {
                const c = document.createElement('canvas'); c.width = c.height = 128;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#800'; ctx.fillRect(0,0,128,128);
                ctx.strokeStyle = '#a22'; ctx.lineWidth=2;
                for(let i=0; i<128; i+=10) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(128, i+20); ctx.stroke(); }
                return new THREE.CanvasTexture(c);
            }
        };
        TF.generate();

        // --- 3. THREE SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setClearColor(0x050308, 1);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        scene.fog = new THREE.FogExp2(CFG.COLORS.FOG, 0.018);

        // Lights
        const moon = new THREE.DirectionalLight(0xc8b8ff, 1.2);
        moon.position.set(-15, 30, -10); moon.castShadow = true;
        scene.add(moon);
        scene.add(new THREE.AmbientLight(0x0d0520, 0.5));

        // --- 4. WORLD ---
        const groundMat = new THREE.MeshStandardMaterial({ map: TF.ground, roughness: 0.95 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 60), groundMat);
        ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
        scene.add(ground);

        const trees = [];
        for (let i = 0; i < 40; i++) {
            const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
            tree.position.set(i % 2 === 0 ? -15 : 15, 3, -i * 25);
            scene.add(tree); trees.push(tree);
        }

        // --- 5. COURAGE ---
        function createCourage() {
            const group = new THREE.Group();
            const mat = new THREE.MeshToonMaterial({ color: CFG.COLORS.PINK, emissive: CFG.COLORS.PINK, emissiveIntensity: 0.2 });
            const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), mat); body.scale.y = 0.85;
            const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), mat); head.position.y = 1.2;
            const legs = [];
            for(let i=0; i<4; i++) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6), mat);
                leg.position.set(i < 2 ? -0.5 : 0.5, -0.8, i % 2 === 0 ? 0.4 : -0.4);
                group.add(leg); legs.push(leg);
            }
            group.add(body, head);
            const rim = new THREE.PointLight(0xff88cc, 2.5, 4, 2);
            group.add(rim); rim.position.set(1.5, 1, 1);
            group.traverse(o => { if(o.isMesh) o.castShadow = true; });
            return { group, legs, body };
        }
        const player = createCourage();
        scene.add(player.group);

        const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        shadow.rotation.x = -Math.PI/2; shadow.position.y = 0.02;
        scene.add(shadow);

        // --- STATE ---
        let S = {
            status: 'TITLE', score: 0, highScore: localStorage.getItem('courage_v2_high') || 0,
            speed: CFG.BASE_SPEED, lane: 1, oldLane: 1, switching: false, switchProg: 0,
            jump: { active: false, vel: 0 }, lives: 3, invincible: 0,
            obs: []
        };

        // --- AUDIO ---
        let audioCtx = null;
        const playSFX = (freq, type = 'sine') => {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
            o.type = type; o.frequency.setValueAtTime(freq, audioCtx.currentTime);
            g.gain.setValueAtTime(0.1, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.2);
        };

        // Pools
        for(let i=0; i<15; i++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshToonMaterial({ map: TF.katz }));
            m.visible = false; scene.add(m); S.obs.push({ mesh: m, active: false });
        }

        const clock = new THREE.Clock();
        const update = () => {
            const dt = clock.getDelta();
            const time = clock.getElapsedTime();

            if (S.status === 'PLAYING') {
                S.score += S.speed * 2; S.speed += CFG.SPEED_INC;

                // lateral slide
                if (S.switching) {
                    S.switchProg += dt / 0.14;
                    if (S.switchProg >= 1) { S.switchProg = 1; S.switching = false; }
                    const t = 1 - Math.pow(1 - S.switchProg, 3);
                    player.group.position.x = THREE.MathUtils.lerp(CFG.LANES[S.oldLane], CFG.LANES[S.lane], t);
                    player.body.rotation.z = THREE.MathUtils.lerp(player.body.rotation.z, (S.lane - S.oldLane) * -0.15, 0.2);
                } else {
                    player.body.rotation.z = THREE.MathUtils.lerp(player.body.rotation.z, 0, 0.1);
                }

                // jump
                if (S.jump.active) {
                    S.jump.vel += CFG.GRAVITY * dt;
                    player.group.position.y += S.jump.vel * dt;
                    if (player.group.position.y <= 0) { player.group.position.y = 0; S.jump.active = false; }
                }

                // animations
                const rT = time * 15 * S.speed;
                player.legs.forEach((l, i) => l.rotation.x = Math.sin(rT + (i%2)*Math.PI) * 0.8);
                shadow.position.x = player.group.position.x;
                shadow.scale.setScalar(1 - player.group.position.y * 0.2);
                groundMat.map.offset.y -= S.speed * dt * 5;

                // spawn & collision
                if (Math.random() < 0.02) {
                    const o = S.obs.find(x => !x.active);
                    if (o) { o.active = true; o.mesh.visible = true; o.mesh.position.set(CFG.LANES[Math.floor(Math.random()*3)], 2, -150); }
                }
                S.obs.forEach(o => {
                    if (!o.active) return;
                    o.mesh.position.z += S.speed * 80 * dt;
                    if (o.mesh.position.z > 20) { o.active = false; o.mesh.visible = false; }
                    if (o.active && S.invincible <= 0 && player.group.position.distanceTo(o.mesh.position) < 2.5) {
                        S.lives--; S.invincible = 2; playSFX(150, 'sawtooth');
                        if (S.lives <= 0) S.status = 'GAME_OVER';
                    }
                });

                if (S.invincible > 0) { S.invincible -= dt; player.group.visible = Math.floor(time*10)%2===0; }
                else player.group.visible = true;

                const sEl = document.getElementById('score-val'); if(sEl) sEl.innerText = Math.floor(S.score);
                const lEl = document.getElementById('lives-val'); if(lEl) lEl.innerText = '❤'.repeat(S.lives);
            }
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.group.position.x * 0.15, 0.08);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4 + player.group.position.y * 0.2, 0.1);
            camera.lookAt(player.group.position.x * 0.1, 1.5, -5);
        };

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            update();
            renderer.render(scene, camera);
        };
        animate();

        const handleInput = (e) => {
            if (S.status !== 'PLAYING') { S.status = 'PLAYING'; S.score = 0; S.lives = 3; S.speed = CFG.BASE_SPEED; return; }
            if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && !S.switching) { if(S.lane > 0) { S.oldLane = S.lane; S.lane--; S.switching = true; S.switchProg = 0; playSFX(300); } }
            if ((e.code === 'ArrowRight' || e.code === 'KeyD') && !S.switching) { if(S.lane < 2) { S.oldLane = S.lane; S.lane++; S.switching = true; S.switchProg = 0; playSFX(300); } }
            if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !S.jump.active) { S.jump.active = true; S.jump.vel = CFG.JUMP_FORCE; playSFX(400); }
        };

        window.addEventListener('keydown', handleInput);
        return () => {
            window.removeEventListener('keydown', handleInput);
            cancelAnimationFrame(frameIdRef.current);
            renderer.dispose();
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#050308', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: '#ff69b4', fontFamily: "'Creepster', cursive", padding: '20px' }}>
                <div style={{ fontSize: '32px' }}>SCORE: <span id="score-val">0</span></div>
                <div style={{ fontSize: '24px', marginTop: '10px' }} id="lives-val">❤❤❤</div>
            </div>
        </div>
    );
}


