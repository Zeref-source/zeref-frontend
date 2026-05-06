import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CourageRuns3D() {
    const mountRef = useRef(null);
    const frameIdRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Use parent dimensions or fallback to window
        let width = mount.clientWidth || window.innerWidth;
        let height = mount.clientHeight || window.innerHeight;

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
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        
        renderer.setClearColor(0x050308, 1);
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        scene.fog = new THREE.FogExp2(CFG.COLORS.FOG, 0.018);

        const ambientLight = new THREE.AmbientLight(0x4b2a8a, 0.6);
        scene.add(ambientLight);

        const moonlight = new THREE.DirectionalLight(0xb0a0ff, 1.0);
        moonlight.position.set(10, 20, 10);
        moonlight.castShadow = true;
        scene.add(moonlight);

        // --- 3. WORLD ---
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 1000),
            new THREE.MeshPhongMaterial({ color: CFG.COLORS.GROUND })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const trees = [];
        for (let i = 0; i < 40; i++) {
            const tree = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
            tree.position.set(i % 2 === 0 ? -15 : 15, 3, -i * 25);
            scene.add(tree);
            trees.push(tree);
        }

        // --- 4. COURAGE ---
        function createCourage() {
            const courage = new THREE.Group();
            const mat = new THREE.MeshToonMaterial({ color: CFG.COLORS.PINK });
            const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), mat);
            head.position.y = 1.2;
            courage.add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), mat));
            courage.add(head);
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

        const player = createCourage();
        scene.add(player.mesh);

        const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        scene.add(shadow);

        // Pools
        const obstaclePool = [];
        for (let i = 0; i < 10; i++) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshToonMaterial({ color: 0x880000 }));
            mesh.visible = false;
            scene.add(mesh);
            obstaclePool.push({ mesh, active: false });
        }

        // --- STATE ---
        let gameState = 'TITLE';
        let score = 0;
        let lives = 3;
        let speed = CFG.BASE_SPEED;
        let lane = 1;
        let jumping = false;
        let jumpTime = 0;
        let invincible = 0;

        const update = () => {
            const isPlaying = gameState === 'PLAYING';
            if (isPlaying) {
                score += speed;
                speed = Math.min(2, CFG.BASE_SPEED + score / 5000);
                const targetX = CFG.LANES[lane];
                player.mesh.position.x = THREE.MathUtils.lerp(player.mesh.position.x, targetX, 0.1);
                if (jumping) {
                    const t = (Date.now() - jumpTime) / CFG.JUMP_DUR;
                    if (t >= 1) { jumping = false; player.mesh.position.y = 0; }
                    else player.mesh.position.y = Math.sin(t * Math.PI) * 4;
                }
                const animTime = Date.now() * 0.01 * speed;
                player.legs.forEach((l, i) => { l.rotation.x = Math.sin(animTime + (i % 2) * Math.PI) * 0.8; });
                shadow.position.x = player.mesh.position.x;
                shadow.scale.setScalar(1 - player.mesh.position.y * 0.15);
                trees.forEach(t => { t.position.z += speed * 10; if (t.position.z > 20) t.position.z -= 1000; });
                if (Math.random() < 0.02) {
                    const o = obstaclePool.find(x => !x.active);
                    if (o) { o.active = true; o.mesh.visible = true; o.mesh.position.set(CFG.LANES[Math.floor(Math.random() * 3)], 1, -300); }
                }
                obstaclePool.forEach(o => {
                    if (!o.active) return;
                    o.mesh.position.z += speed * 10;
                    if (o.mesh.position.z > 20) { o.active = false; o.mesh.visible = false; }
                    if (invincible <= 0 && player.mesh.position.distanceTo(o.mesh.position) < 2) {
                        lives--; invincible = 60;
                        if (lives <= 0) gameState = 'GAME_OVER';
                    }
                });
                if (invincible > 0) { invincible--; player.mesh.visible = Math.floor(Date.now() / 100) % 2 === 0; }
                else player.mesh.visible = true;
                
                const sEl = document.getElementById('score-val'); if(sEl) sEl.innerText = Math.floor(score);
                const lEl = document.getElementById('lives-val'); if(lEl) lEl.innerText = '❤'.repeat(lives);
            }
            camera.position.set(player.mesh.position.x * 0.5, 6 + player.mesh.position.y * 0.2, 12);
            camera.lookAt(player.mesh.position.x, 2, 0);
        };

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            update();
            renderer.render(scene, camera);
        };
        animate();

        const handleInput = (e) => {
            if (gameState !== 'PLAYING') {
                gameState = 'PLAYING'; score = 0; lives = 3; speed = CFG.BASE_SPEED;
                return;
            }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') lane = Math.max(0, lane - 1);
            if (e.code === 'ArrowRight' || e.code === 'KeyD') lane = Math.min(2, lane + 1);
            if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && !jumping) { jumping = true; jumpTime = Date.now(); }
        };

        window.addEventListener('keydown', handleInput);
        const handleResize = () => {
            const w = mount.clientWidth; const h = mount.clientHeight;
            camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('keydown', handleInput);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#050308', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
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

