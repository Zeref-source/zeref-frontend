import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * COURAGE RUNS 3D - RealityDive Edition
 * -----------------------------------------
 * Upgrade from 2D Canvas to Polished 3D via Three.js
 */

export default function CourageRuns3D() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // --- 1. CONFIG ---
        const CFG = {
            LANES: [-4, 0, 4],
            JUMP_DUR: 600,
            SLIDE_DUR: 500,
            BASE_SPEED: 0.5,
            GRAVITY: 0.015,
            LIVES: 3,
            COLORS: {
                PINK: 0xFF69B4,
                DARK_PINK: 0xD81B60,
                SKY_TOP: 0x0a0030,
                SKY_BOTTOM: 0x1a0030,
                FOG: 0x1a0030,
                GROUND: 0x2a1a0a
            }
        };

        // --- 2. THREE SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);

        scene.fog = new THREE.FogExp2(CFG.COLORS.FOG, 0.018);

        const ambientLight = new THREE.AmbientLight(0x1a0a2e, 0.6);
        scene.add(ambientLight);

        const moonlight = new THREE.DirectionalLight(0xb0a0ff, 0.8);
        moonlight.position.set(10, 20, 10);
        moonlight.castShadow = true;
        moonlight.shadow.mapSize.set(2048, 2048);
        scene.add(moonlight);

        // --- 3. WORLD ---
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 1000),
            new THREE.MeshPhongMaterial({ color: CFG.COLORS.GROUND })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(500, 32, 32),
            new THREE.MeshBasicMaterial({ color: CFG.COLORS.SKY_TOP, side: THREE.BackSide })
        );
        scene.add(sky);

        // Environment Objects
        const trees = [];
        for (let i = 0; i < 40; i++) {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
            tree.add(trunk);
            tree.position.set(i % 2 === 0 ? -15 : 15, 3, -i * 25);
            scene.add(tree);
            trees.push(tree);
        }

        // --- 4. COURAGE ---
        function createCourage() {
            const courage = new THREE.Group();
            const mat = new THREE.MeshToonMaterial({ color: CFG.COLORS.PINK });
            const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff });
            const blackMat = new THREE.MeshToonMaterial({ color: 0x000000 });

            const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), mat);
            body.scale.y = 0.85;
            courage.add(body);

            const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), mat);
            head.position.y = 1.2;
            courage.add(head);

            const earL = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.5, 8), new THREE.MeshToonMaterial({ color: CFG.COLORS.DARK_PINK }));
            earL.position.set(-0.8, 1.8, 0);
            earL.rotation.z = Math.PI / 4;
            const earR = earL.clone(); earR.position.x = 0.8; earR.rotation.z = -Math.PI / 4;
            courage.add(earL, earR);

            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), whiteMat);
            eyeL.position.set(-0.4, 1.5, 0.9);
            const eyeR = eyeL.clone(); eyeR.position.x = 0.4;
            courage.add(eyeL, eyeR);

            const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), blackMat);
            pupilL.position.set(-0.4, 1.5, 1.25);
            const pupilR = pupilL.clone(); pupilR.position.x = 0.4;
            courage.add(pupilL, pupilR);

            const legs = [];
            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6), mat);
                leg.position.set(i < 2 ? -0.5 : 0.5, -0.8, i % 2 === 0 ? 0.4 : -0.4);
                courage.add(leg);
                legs.push(leg);
            }

            courage.traverse(o => { if (o.isMesh) o.castShadow = true; });
            return { mesh: courage, legs };
        }

        const courage = createCourage();
        scene.add(courage.mesh);

        const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        scene.add(shadow);

        // --- 5. OBSTACLES & COLLECTIBLES ---
        const obstaclePool = [];
        for (let i = 0; i < 15; i++) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), new THREE.MeshToonMaterial({ color: 0x880000 }));
            mesh.visible = false;
            scene.add(mesh);
            obstaclePool.push({ mesh, active: false });
        }

        const cookiePool = [];
        for (let i = 0; i < 20; i++) {
            const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.2, 8, 16), new THREE.MeshPhongMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.5 }));
            mesh.visible = false;
            scene.add(mesh);
            cookiePool.push({ mesh, active: false });
        }

        // --- STATE ---
        let gameState = 'TITLE';
        let score = 0;
        let lives = CFG.LIVES;
        let speed = CFG.BASE_SPEED;
        let lane = 1;
        let jumping = false;
        let jumpTime = 0;
        let invincible = 0;

        // --- AUDIO ---
        let audioCtx = null;
        const playSound = (freq, type = 'sine') => {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + 0.2);
            g.gain.setValueAtTime(0.1, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            o.connect(g); g.connect(audioCtx.destination);
            o.start(); o.stop(audioCtx.currentTime + 0.2);
        };

        // --- LOOP ---
        const update = () => {
            if (gameState === 'PLAYING') {
                score += speed;
                speed = Math.min(2, CFG.BASE_SPEED + score / 5000);

                // Movement
                const targetX = CFG.LANES[lane];
                courage.mesh.position.x = THREE.MathUtils.lerp(courage.mesh.position.x, targetX, 0.1);

                if (jumping) {
                    const t = (Date.now() - jumpTime) / CFG.JUMP_DUR;
                    if (t >= 1) { jumping = false; courage.mesh.position.y = 0; }
                    else courage.mesh.position.y = Math.sin(t * Math.PI) * 4;
                }

                // Animation
                const time = Date.now() * 0.01 * speed;
                courage.legs.forEach((l, i) => { l.rotation.x = Math.sin(time + (i % 2) * Math.PI) * 0.8; });
                courage.mesh.rotation.z = Math.sin(time) * 0.05;
                shadow.position.x = courage.mesh.position.x;
                shadow.scale.setScalar(1 - courage.mesh.position.y * 0.15);

                // Camera
                camera.position.set(courage.mesh.position.x * 0.5, 6 + courage.mesh.position.y * 0.2, 12);
                camera.lookAt(courage.mesh.position.x, 2, 0);

                // Scroll
                trees.forEach(t => { t.position.z += speed * 10; if (t.position.z > 20) t.position.z -= 1000; });
                
                // Spawn
                if (Math.random() < 0.02) {
                    const o = obstaclePool.find(x => !x.active);
                    if (o) { o.active = true; o.mesh.visible = true; o.mesh.position.set(CFG.LANES[Math.floor(Math.random() * 3)], 1.25, -300); }
                }
                if (Math.random() < 0.04) {
                    const c = cookiePool.find(x => !x.active);
                    if (c) { c.active = true; c.mesh.visible = true; c.mesh.position.set(CFG.LANES[Math.floor(Math.random() * 3)], 1, -300); }
                }

                // Collisions
                obstaclePool.forEach(o => {
                    if (!o.active) return;
                    o.mesh.position.z += speed * 10;
                    if (o.mesh.position.z > 20) { o.active = false; o.mesh.visible = false; }
                    if (o.active && invincible <= 0 && courage.mesh.position.distanceTo(o.mesh.position) < 2.5) {
                        lives--; invincible = 60; playSound(150, 'sawtooth');
                        if (lives <= 0) gameState = 'GAME_OVER';
                    }
                });

                cookiePool.forEach(c => {
                    if (!c.active) return;
                    c.mesh.position.z += speed * 10; c.mesh.rotation.y += 0.05;
                    if (c.mesh.position.z > 20) { c.active = false; c.mesh.visible = false; }
                    if (c.active && courage.mesh.position.distanceTo(c.mesh.position) < 2) {
                        c.active = false; c.mesh.visible = false; score += 100; playSound(800);
                    }
                });

                if (invincible > 0) { invincible--; courage.mesh.visible = Math.floor(Date.now() / 100) % 2 === 0; }
                else courage.mesh.visible = true;

                // Sync HUD (Using DOM via React State would be better, but keeping it internal for performance)
                const sEl = document.getElementById('score-val'); if(sEl) sEl.innerText = Math.floor(score);
                const lEl = document.getElementById('lives-val'); if(lEl) lEl.innerText = '❤'.repeat(lives);
            }
        };

        const animate = () => {
            requestAnimationFrame(animate);
            update();
            renderer.render(scene, camera);
        };
        animate();

        const handleInput = (e) => {
            if (gameState !== 'PLAYING') { gameState = 'PLAYING'; score = 0; lives = CFG.LIVES; speed = CFG.BASE_SPEED; return; }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') lane = Math.max(0, lane - 1);
            if (e.code === 'ArrowRight' || e.code === 'KeyD') lane = Math.min(2, lane + 1);
            if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !jumping) { jumping = true; jumpTime = Date.now(); playSound(400); }
        };

        window.addEventListener('keydown', handleInput);
        
        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('keydown', handleInput);
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            
            {/* UI Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', color: '#ff69b4', fontFamily: "'Creepster', cursive", padding: '20px' }}>
                <div style={{ fontSize: '32px' }}>SCORE: <span id="score-val">0</span></div>
                <div style={{ fontSize: '24px', marginTop: '10px' }} id="lives-val">❤❤❤</div>
                
                <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', color: '#fff', opacity: 0.6 }}>ARROWS TO MOVE & JUMP</div>
                </div>
            </div>
        </div>
    );
}
