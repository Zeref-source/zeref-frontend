import React, { useEffect, useRef } from 'react';

/**
 * COURAGE RUNS! - 2D Canvas Endless Runner
 * Ported to React Component for RealityDive
 */

export default function CourageRuns2D() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // --- CONFIG ---
        const CFG = {
            W: 900,
            H: 500,
            LANE_Y: 350,
            LANES: [-200, 0, 200],
            GRAVITY: 0.8,
            JUMP_FORCE: -15,
            BASE_SPEED: 8,
            SPEED_INC: 0.05,
            SPAWN_INTERVAL: 1500,
            COLORS: {
                SKY: '#1a0a2a',
                GROUND: '#2a1a3a',
                PATH: '#1a0a2a',
                PINK: '#ff99cc',
                ORANGE: '#ff6b2b',
                PURPLE: '#4b2a8a'
            }
        };

        // --- STATE ---
        let S = {
            status: 'TITLE',
            score: 0,
            highScore: localStorage.getItem('courage_high_score') || 0,
            speed: CFG.BASE_SPEED,
            lastSpawn: 0,
            lane: 1,
            playerX: 0,
            playerY: 0,
            playerVY: 0,
            isJumping: false,
            isSliding: false,
            slideTimer: 0,
            lives: 3,
            invincible: 0,
            multiplier: 1,
            multiplierTimer: 0,
            shield: 0,
            obstacles: [],
            collectibles: [],
            muted: false,
            touch: { startX: 0, startY: 0 }
        };

        // --- AUDIO ---
        let audioCtx = null;
        const initAudio = () => { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); };
        const playTone = (freq, dur, type = 'sine', vol = 0.1) => {
            if (S.muted || !audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + dur);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + dur);
        };
        const playNoise = (dur, vol = 0.1, low = false) => {
            if (S.muted || !audioCtx) return;
            const bufferSize = audioCtx.sampleRate * dur;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = low ? 'lowpass' : 'highpass';
            filter.frequency.value = low ? 400 : 1000;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            noise.start();
        };
        const SFX = {
            jump: () => playTone(440, 0.2),
            slide: () => playNoise(0.3, 0.05),
            collect: () => playTone(880, 0.15, 'square', 0.05),
            hit: () => { playNoise(0.5, 0.2, true); playTone(150, 0.4, 'sawtooth', 0.1); },
            power: () => playTone(660, 0.3)
        };

        // --- DRAW ---
        const drawCourage = (x, y) => {
            ctx.save(); ctx.translate(x, y);
            if (S.shield > 0 && Math.floor(Date.now() / 100) % 2 === 0) { ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; }
            else if (S.invincible > 0 && Math.floor(Date.now() / 100) % 2 === 0) ctx.globalAlpha = 0.5;
            ctx.fillStyle = CFG.COLORS.PINK;
            ctx.beginPath(); ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2); ctx.fill(); // Body
            ctx.beginPath(); ctx.arc(0, -35, 25, 0, Math.PI * 2); ctx.fill(); // Head
            ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-10, -40, 10, 0, Math.PI * 2); ctx.arc(10, -40, 10, 0, Math.PI * 2); ctx.fill(); // Eyes
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-10, -40, 2, 0, Math.PI * 2); ctx.arc(10, -40, 2, 0, Math.PI * 2); ctx.fill(); // Pupils
            ctx.fillStyle = CFG.COLORS.PINK; ctx.beginPath(); ctx.ellipse(-25, -45, 12, 5, Math.PI/4, 0, Math.PI * 2); ctx.ellipse(25, -45, 12, 5, -Math.PI/4, 0, Math.PI * 2); ctx.fill(); // Ears
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(0, -32, 3, 0, Math.PI * 2); ctx.fill(); // Nose
            ctx.restore();
        };

        const drawObstacle = (o) => {
            const sx = CFG.W/2 + (o.x * o.z), sy = CFG.H/2 + (150 * o.z), sc = o.z * 1.5;
            ctx.save(); ctx.translate(sx, sy); ctx.scale(sc, sc);
            if(o.type === 'KATZ') { ctx.fillStyle = '#800'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(15, -80); ctx.lineTo(-15, -80); ctx.close(); ctx.fill(); }
            if(o.type === 'LE_QUACK') { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.ellipse(0, -60, 25, 15, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = 'black'; ctx.fillRect(-15, -85, 30, 15); }
            if(o.type === 'MASK') { ctx.fillStyle = '#5a5'; ctx.beginPath(); ctx.arc(0, -40, 30, 0, Math.PI*2); ctx.fill(); }
            if(o.type === 'WINDMILL') { ctx.strokeStyle = '#666'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -150); ctx.stroke(); }
            ctx.restore();
        };

        const drawUI = () => {
            ctx.font = '32px Creepster'; ctx.fillStyle = CFG.COLORS.ORANGE;
            ctx.textAlign = 'left'; ctx.fillText(`SCORE: ${Math.floor(S.score)}`, 20, 50);
            ctx.textAlign = 'right'; ctx.fillText(`HIGH: ${S.highScore}`, CFG.W - 20, 50);
            for(let i=0; i<3; i++) { ctx.fillStyle = i < S.lives ? '#f33' : '#333'; ctx.fillText('❤', 25 + i*35, 90); }
        };

        // --- LOOP ---
        let lastTime = 0;
        const loop = (time) => {
            const dt = time - lastTime; lastTime = time;
            ctx.clearRect(0, 0, CFG.W, CFG.H);
            
            // Background
            const grad = ctx.createLinearGradient(0, 0, 0, CFG.H); grad.addColorStop(0, '#0a0510'); grad.addColorStop(0.5, CFG.COLORS.SKY);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, CFG.W, CFG.H);
            ctx.fillStyle = CFG.COLORS.GROUND; ctx.beginPath(); ctx.moveTo(0, CFG.H); ctx.lineTo(CFG.W, CFG.H); ctx.lineTo(CFG.W/2 + 100, CFG.H/2); ctx.lineTo(CFG.W/2 - 100, CFG.H/2); ctx.fill();

            if (S.status === 'PLAYING') {
                S.score += (dt / 16); S.speed += CFG.SPEED_INC * (dt / 1000);
                S.playerX += (CFG.LANES[S.lane] - S.playerX) * 0.2;
                if (S.isJumping) { S.playerY += S.playerVY; S.playerVY += CFG.GRAVITY; if (S.playerY >= 0) { S.playerY = 0; S.isJumping = false; } }
                if (S.invincible > 0) S.invincible -= dt;
                if (S.shield > 0) S.shield -= dt;

                if (Date.now() - S.lastSpawn > (CFG.SPAWN_INTERVAL / (S.speed/CFG.BASE_SPEED))) {
                    const lane = Math.floor(Math.random() * 3);
                    const type = ['KATZ', 'LE_QUACK', 'MASK', 'WINDMILL'][Math.floor(Math.random() * 4)];
                    S.obstacles.push({ x: (lane-1)*200, lane, type, z: 0.1 });
                    S.lastSpawn = Date.now();
                }

                S.obstacles.forEach(o => {
                    o.z += (S.speed / 1000);
                    if (o.z > 0.9 && o.z < 1.1 && o.lane === S.lane && S.invincible <= 0 && S.shield <= 0) {
                        S.lives--; S.invincible = 1500; SFX.hit();
                        if (S.lives <= 0) { S.status = 'GAME_OVER'; S.highScore = Math.max(S.highScore, Math.floor(S.score)); localStorage.setItem('courage_high_score', S.highScore); }
                    }
                });
                S.obstacles = S.obstacles.filter(o => o.z < 1.5);
                S.obstacles.sort((a,b) => a.z - b.z).forEach(drawObstacle);
                drawCourage(CFG.W/2 + S.playerX, (CFG.H - 80) + S.playerY);
                drawUI();
            } else if (S.status === 'TITLE') {
                ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
                ctx.textAlign = 'center'; ctx.fillStyle = CFG.COLORS.ORANGE; ctx.font = '80px Creepster'; ctx.fillText('COURAGE RUNS!', CFG.W/2, CFG.H/2);
                ctx.font = '24px Outfit'; ctx.fillStyle = 'white'; ctx.fillText('PRESS SPACE OR TAP TO START', CFG.W/2, CFG.H/2 + 80);
            } else if (S.status === 'GAME_OVER') {
                ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, CFG.W, CFG.H);
                ctx.textAlign = 'center'; ctx.fillStyle = '#f33'; ctx.font = '100px Creepster'; ctx.fillText('STUPID DOG!', CFG.W/2, CFG.H/2);
                ctx.font = '32px Outfit'; ctx.fillStyle = 'white'; ctx.fillText(`FINAL SCORE: ${Math.floor(S.score)}`, CFG.W/2, CFG.H/2 + 80);
            }

            requestAnimationFrame(loop);
        };

        const handleInput = (key) => {
            if (S.status !== 'PLAYING') { initAudio(); S.status = 'PLAYING'; S.score = 0; S.lives = 3; S.speed = CFG.BASE_SPEED; S.obstacles = []; return; }
            if (key === 'LEFT' && S.lane > 0) { S.lane--; SFX.slide(); }
            if (key === 'RIGHT' && S.lane < 2) { S.lane++; SFX.slide(); }
            if (key === 'UP' && !S.isJumping) { S.isJumping = true; S.playerVY = CFG.JUMP_FORCE; SFX.jump(); }
            if (key === 'DOWN') { S.isSliding = true; setTimeout(() => S.isSliding = false, 500); SFX.slide(); }
        };

        const onKeyDown = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleInput('LEFT');
            if (e.code === 'ArrowRight' || e.code === 'KeyD') handleInput('RIGHT');
            if (e.code === 'ArrowUp' || e.code === 'KeyW') handleInput('UP');
            if (e.code === 'ArrowDown' || e.code === 'KeyS') handleInput('DOWN');
            if (e.code === 'Space') handleInput('START');
        };

        window.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(loop);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <canvas ref={canvasRef} width={900} height={500} style={{ maxWidth: '100%', maxHeight: '100%', border: '2px solid #ff6b2b', borderRadius: '8px' }} />
        </div>
    );
}
