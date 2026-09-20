import React, { useEffect, useRef } from "react";
import type { Track } from "./types";

interface UnifiedVisualizerProps {
  analyser: AnalyserNode | null;
  analyserL?: AnalyserNode | null;
  analyserR?: AnalyserNode | null;
  currentTrack: Track | null;
  strobeThreshold?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

const UnifiedVisualizer: React.FC<UnifiedVisualizerProps> = ({
  analyser,
  analyserL,
  analyserR,
  currentTrack,
  strobeThreshold = 0.58,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(0);
  const peaksRef = useRef<number[]>([]);
  const backgroundParticles = useRef<Particle[]>([]);
  const wasBeatRef = useRef<boolean>(false);
  const strobeColorRef = useRef<string>("hsla(50, 95%, 60%, ");
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const img = new Image();
    img.src = "/logo.jpg";
    img.onload = () => {
      logoImageRef.current = img;
    };
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.src = "/LOGO.avif";
      fallbackImg.onload = () => {
        logoImageRef.current = fallbackImg;
      };
    };
  }, []);

  // Sync references to avoid React hook dependency warning in requestAnimationFrame
  const analyserRef = useRef(analyser);
  const analyserLRef = useRef(analyserL);
  const analyserRRef = useRef(analyserR);

  useEffect(() => {
    analyserRef.current = analyser;
    analyserLRef.current = analyserL;
    analyserRRef.current = analyserR;
  }, [analyser, analyserL, analyserR]);

  useEffect(() => {
    const activeAnalyser = analyserRef.current;
    const activeAnalyserL = analyserLRef.current;
    const activeAnalyserR = analyserRRef.current;

    if (!canvasRef.current || (!activeAnalyser && !activeAnalyserL && !activeAnalyserR)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const fftSize = 512; // Optimized size for high performance with combined visualizers
    if (activeAnalyser) activeAnalyser.fftSize = fftSize;
    if (activeAnalyserL) activeAnalyserL.fftSize = fftSize;
    if (activeAnalyserR) activeAnalyserR.fftSize = fftSize;

    const bufferLength = activeAnalyserL 
      ? activeAnalyserL.frequencyBinCount 
      : (activeAnalyser ? activeAnalyser.frequencyBinCount : 256);

    const dataArrayTimeL = new Uint8Array(bufferLength);
    const dataArrayTimeR = new Uint8Array(bufferLength);
    const dataArrayTimeMono = new Uint8Array(bufferLength);
    const dataArrayFreqL = new Uint8Array(bufferLength);
    const dataArrayFreqR = new Uint8Array(bufferLength);
    const dataArrayFreqMono = new Uint8Array(bufferLength);

    // Setup peaks for EQ bars
    const barCount = 64;
    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
    }

    // Setup background particles (orbiting stars matching the circular star trails in the logo background)
    if (backgroundParticles.current.length === 0) {
      for (let i = 0; i < 45; i++) {
        const rand = Math.random();
        backgroundParticles.current.push({
          x: Math.random() * 320 + 40, // Orbit radius (distance from center)
          y: Math.random() * Math.PI * 2, // Current angle (in radians)
          vx: (Math.random() * 0.002 + 0.0006) * (Math.random() > 0.5 ? 1 : -1), // Angular speed
          vy: 0, // Unused
          alpha: Math.random() * 0.45 + 0.1,
          size: Math.random() * 1.8 + 0.8,
          // Color scheme: Beige (from logo), Yellow, Cyan, Pink
          color: rand > 0.7 ? "#c39c6b" : (rand > 0.45 ? "#facc15" : (rand > 0.2 ? "#06b6d4" : "#ec4899")),
        });
      }
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.clientWidth || 800;
      const height = rect.height || canvas.clientHeight || 400;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        // Re-distribute orbit radii dynamically
        backgroundParticles.current.forEach(p => {
          p.x = Math.random() * (Math.min(width, height) * 0.75) + 30;
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Scale mouse position to coordinate space of canvas
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      const hasStereo = activeAnalyserL && activeAnalyserR;

      // 1. Gather all data
      if (hasStereo) {
        activeAnalyserL.getByteTimeDomainData(dataArrayTimeL);
        activeAnalyserR.getByteTimeDomainData(dataArrayTimeR);
        activeAnalyserL.getByteFrequencyData(dataArrayFreqL);
        activeAnalyserR.getByteFrequencyData(dataArrayFreqR);
      } else if (activeAnalyser) {
        activeAnalyser.getByteTimeDomainData(dataArrayTimeMono);
        activeAnalyser.getByteFrequencyData(dataArrayFreqMono);
        // Fallback L/R
        for (let i = 0; i < bufferLength; i++) {
          dataArrayTimeL[i] = dataArrayTimeMono[i];
          dataArrayTimeR[i] = dataArrayTimeMono[(i + 4) % bufferLength];
          dataArrayFreqL[i] = dataArrayFreqMono[i];
          dataArrayFreqR[i] = dataArrayFreqMono[i];
        }
      }

      // Calculate general volume intensity
      let freqSum = 0;
      for (let i = 0; i < 32; i++) {
        freqSum += dataArrayFreqL[i];
      }
      const averageVolume = freqSum / 32;
      const volumeRatio = averageVolume / 255; // 0.0 to 1.0

      // Frequency bands ratios for reactive Gourd parts
      const bassRatio = (dataArrayFreqL[3] || 0) / 255;
      const midRatio = (dataArrayFreqL[13] || 0) / 255;
      const highRatio = (dataArrayFreqL[26] || 0) / 255;

      // 2. Clear canvas with afterglow effect
      ctx.fillStyle = "rgba(10, 11, 16, 0.22)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // BEAT STROBE FLASH (Neon Random Color on powerful beats)
      const isBeat = volumeRatio > strobeThreshold;
      if (isBeat) {
        if (!wasBeatRef.current) {
          // Beat onset: Pick a random neon color (hues: yellow, cyan, pink, violet, green, orange)
          const hues = [50, 190, 325, 280, 120, 25];
          const randomHue = hues[Math.floor(Math.random() * hues.length)];
          strobeColorRef.current = `hsla(${randomHue}, 95%, 60%, `;
        }
        ctx.save();
        ctx.fillStyle = strobeColorRef.current + `${0.04 + (volumeRatio - strobeThreshold) * 0.35})`; // Strobe flash
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      wasBeatRef.current = isBeat;

      // Dynamic screen shake (secousses) on strong beats
      const shakeAmplitude = isBeat ? (volumeRatio - strobeThreshold) * 45 : 0;
      const shakeX = (Math.random() - 0.5) * shakeAmplitude;
      const shakeY = (Math.random() - 0.5) * shakeAmplitude;
      
      ctx.save();
      ctx.translate(shakeX, shakeY);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const minDim = Math.min(canvas.width, canvas.height);
      const baseRadius = minDim * 0.16 + volumeRatio * 16;
      rotationRef.current += 0.004 + volumeRatio * 0.008;

      const topLoopRad = baseRadius * (0.22 + highRatio * 0.06);
      const topInnerRad = baseRadius * (0.09 + highRatio * 0.03);
      const upperBulbRad = baseRadius * (0.72 + midRatio * 0.08);
      const lowerBulbRad = baseRadius * (1.05 + bassRatio * 0.1);

      // 3. Draw Cyber Grid & Tech Geometric Elements (Noctalia styled)
      ctx.save();
      // Grid flashes the random beat color on the beat, otherwise uses subtle purple
      ctx.strokeStyle = isBeat
        ? strobeColorRef.current + `${0.08 + volumeRatio * 0.12})`
        : `rgba(139, 92, 246, ${0.025 + volumeRatio * 0.05})`;
      ctx.lineWidth = 1;
      const gridRows = 8;
      for (let i = 1; i < gridRows; i++) {
        const y = (canvas.height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      const gridCols = 16;
      for (let i = 1; i < gridCols; i++) {
        const x = (canvas.width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // 3.1. Draw a Grid Mesh of Audio-Reactive Waveforms (Quadrillage)
      // 3.1. Draw a Grid Mesh of Audio-Reactive Waveforms (Quadrillage) warping around logo contours
      const warpPointAroundLogo = (x: number, y: number) => {
        let wx = x;
        let wy = y;
        const circles = [
          { cx: centerX, cy: centerY - baseRadius * 2.05, r: baseRadius * 0.24 }, // Top loop
          { cx: centerX, cy: centerY - baseRadius * 1.25, r: baseRadius * 0.74 }, // Upper bulb
          { cx: centerX, cy: centerY, r: baseRadius * 1.07 }                       // Lower bulb
        ];
        for (const c of circles) {
          const dx = wx - c.cx;
          const dy = wy - c.cy;
          const dist = Math.hypot(dx, dy);
          const avoidDist = c.r + 12; // Radius + margin
          if (dist < avoidDist && dist > 0) {
            const push = avoidDist - dist;
            wx += (dx / dist) * push;
            wy += (dy / dist) * push;
          }
        }
        return { x: wx, y: wy };
      };

      const drawMeshWaveHorizontal = (yCenter: number, data: Uint8Array, color: string) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.12 + volumeRatio * 0.18;
        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const v = data[i] / 128.0;
          const yOffset = v - 1.0;
          const x = i * sliceWidth;
          const y = yCenter + yOffset * 22 * Math.sin((i / bufferLength) * Math.PI);
          
          const warped = warpPointAroundLogo(x, y);

          if (i === 0) ctx.moveTo(warped.x, warped.y);
          else ctx.lineTo(warped.x, warped.y);
        }
        ctx.stroke();
        ctx.restore();
      };

      const drawMeshWaveVertical = (xCenter: number, data: Uint8Array, color: string) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.12 + volumeRatio * 0.18;
        ctx.beginPath();
        const sliceHeight = canvas.height / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const v = data[i] / 128.0;
          const xOffset = v - 1.0;
          const y = i * sliceHeight;
          const x = xCenter + xOffset * 22 * Math.sin((i / bufferLength) * Math.PI);
          
          const warped = warpPointAroundLogo(x, y);

          if (i === 0) ctx.moveTo(warped.x, warped.y);
          else ctx.lineTo(warped.x, warped.y);
        }
        ctx.stroke();
        ctx.restore();
      };

      // 4 horizontal waveforms forming the horizontal lines of the mesh
      drawMeshWaveHorizontal(canvas.height * 0.2, dataArrayTimeL, "#06b6d4"); // Cyan
      drawMeshWaveHorizontal(canvas.height * 0.4, dataArrayTimeR, "#ec4899"); // Pink
      drawMeshWaveHorizontal(canvas.height * 0.6, dataArrayTimeL, "#ec4899"); // Pink
      drawMeshWaveHorizontal(canvas.height * 0.8, dataArrayTimeR, "#06b6d4"); // Cyan

      // 4 vertical waveforms forming the vertical lines of the mesh
      drawMeshWaveVertical(canvas.width * 0.2, dataArrayTimeR, "#ec4899"); // Pink
      drawMeshWaveVertical(canvas.width * 0.4, dataArrayTimeL, "#06b6d4"); // Cyan
      drawMeshWaveVertical(canvas.width * 0.6, dataArrayTimeR, "#06b6d4"); // Cyan
      drawMeshWaveVertical(canvas.width * 0.8, dataArrayTimeL, "#ec4899"); // Pink

      // Tech Concentric Rings (Radar/Grid style - now with logo beige/cyan accents)
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.03 + volumeRatio * 0.05})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.55, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(195, 156, 107, ${0.06 + volumeRatio * 0.08})`; // Logo beige dotted ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // --- SPIRALES INFERNALES (Hypnotic, beat-pulsing interweaving spirals) ---
      ctx.save();
      const spiralRot = rotationRef.current * 1.5;
      const maxSpiralAngle = 8 * Math.PI; // 4 rotations
      const spiralStep = 0.08;
      
      // Spiral 1: Neon Pink rotating clockwise
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.05 + volumeRatio * 0.15})`;
      ctx.shadowColor = "#ec4899";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let theta = 0; theta < maxSpiralAngle; theta += spiralStep) {
        const spiralRadius = theta * (1.2 + volumeRatio * 4.5);
        const x = centerX + Math.cos(theta + spiralRot) * spiralRadius;
        const y = centerY + Math.sin(theta + spiralRot) * spiralRadius;
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Spiral 2: Neon Cyan rotating counter-clockwise
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 + volumeRatio * 0.15})`;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let theta = 0; theta < maxSpiralAngle; theta += spiralStep) {
        const spiralRadius = theta * (1.2 + volumeRatio * 4.5);
        const x = centerX + Math.cos(theta - spiralRot) * spiralRadius;
        const y = centerY + Math.sin(theta - spiralRot) * spiralRadius;
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // --- LOGO INSPIRATION: Double-chamber speaker/gourd silhouette outline in background ---
      ctx.save();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`; // Logo beige
      ctx.shadowColor = "#c39c6b";
      ctx.shadowBlur = 8 + volumeRatio * 12;
      ctx.lineWidth = 1.6;

      // 1. Top Carrying Loop / Handle (Reacts to High frequencies)
      if (highRatio > 0.6) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)"; // Flashes cyan on highs
        ctx.shadowColor = "#06b6d4";
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 2.05, topLoopRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 2.05, topInnerRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`; // Reset stroke
      ctx.shadowColor = "#c39c6b";

      // 2. Upper Bulb / Chamber (Reacts to Mid/Vocal frequencies)
      if (midRatio > 0.6) {
        ctx.strokeStyle = "rgba(236, 72, 153, 0.4)"; // Flashes pink on mids
        ctx.shadowColor = "#ec4899";
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 1.25, upperBulbRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`; // Reset stroke
      ctx.shadowColor = "#c39c6b";

      // 3. Lower Bulb / Chamber (Reacts to Bass/Kick)
      ctx.beginPath();
      ctx.arc(centerX, centerY, lowerBulbRad, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Two feet at the bottom (Displace slightly with bass kick)
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      const feetDisplacement = baseRadius * (0.55 + bassRatio * 0.05);
      // Left foot
      ctx.beginPath();
      ctx.arc(centerX - feetDisplacement, centerY + baseRadius * 0.9, baseRadius * 0.12, Math.PI * 0.7, Math.PI * 1.2);
      ctx.stroke();
      // Right foot
      ctx.beginPath();
      ctx.arc(centerX + feetDisplacement, centerY + baseRadius * 0.9, baseRadius * 0.12, Math.PI * 1.8, Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();

      // --- LOGO INSPIRATION: Speaker surround ring with 6 screws/points ---
      ctx.save();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.12 + volumeRatio * 0.15})`; // Beige speaker ring
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, 0, Math.PI * 2);
      ctx.stroke();

      // Draw the 6 dots/screws around the circle (just like the speaker cone in the logo)
      ctx.fillStyle = `rgba(195, 156, 107, ${0.35 + volumeRatio * 0.45})`;
      ctx.shadowColor = "#c39c6b";
      ctx.shadowBlur = 4;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const sx = centerX + Math.cos(angle) * (baseRadius + 14);
        const sy = centerY + Math.sin(angle) * (baseRadius + 14);
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Outer background slow rotating octagon (now colored in logo beige)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotationRef.current * 0.15);
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.03 + volumeRatio * 0.05})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      const octSides = 8;
      const octRadius = baseRadius * 2.45;
      for (let i = 0; i <= octSides; i++) {
        const angle = (i * 2 * Math.PI) / octSides;
        const ox = Math.cos(angle) * octRadius;
        const oy = Math.sin(angle) * octRadius;
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Cyber Corner brackets
      const bracketSize = 14;
      const bracketMargin = 12;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
      ctx.lineWidth = 1.5;

      // Top Left
      ctx.beginPath();
      ctx.moveTo(bracketMargin + bracketSize, bracketMargin);
      ctx.lineTo(bracketMargin, bracketMargin);
      ctx.lineTo(bracketMargin, bracketMargin + bracketSize);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - bracketMargin - bracketSize, bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, bracketMargin + bracketSize);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(bracketMargin + bracketSize, canvas.height - bracketMargin);
      ctx.lineTo(bracketMargin, canvas.height - bracketMargin);
      ctx.lineTo(bracketMargin, canvas.height - bracketMargin - bracketSize);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - bracketMargin - bracketSize, canvas.height - bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, canvas.height - bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, canvas.height - bracketMargin - bracketSize);
      ctx.stroke();

      ctx.restore();

      // 4. Update and Draw Background Constellation Particles (Orbiting to trace star trails)
      ctx.save();
      const pts = backgroundParticles.current;
      const ptCoords = pts.map(p => {
        // Increment angle for orbital rotation
        p.y += p.vx * (1 + volumeRatio * 1.6);
        
        // Translate polar coords (radius p.x, angle p.y) to Cartesian (px, py)
        const px = centerX + Math.cos(p.y) * p.x;
        const py = centerY + Math.sin(p.y) * p.x;

        // Mouse attraction effect
        let drawPx = px;
        let drawPy = py;
        if (mouseRef.current.active) {
          const dx = px - mouseRef.current.x;
          const dy = py - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            const pullForce = (130 - dist) / 130;
            // Pull them towards the mouse
            drawPx -= (dx / dist) * pullForce * 20;
            drawPy -= (dy / dist) * pullForce * 20;
          }
        }

        // Twinkle/scintillation: fluctuate alpha slightly over time
        const twinkleFactor = Math.sin(Date.now() * 0.005 + p.x) * 0.08;
        const finalAlpha = Math.max(0.08, Math.min(p.alpha + twinkleFactor, 0.9));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = finalAlpha * (0.6 + volumeRatio * 0.4);
        ctx.beginPath();
        ctx.arc(drawPx, drawPy, p.size, 0, Math.PI * 2);
        ctx.fill();

        return { x: drawPx, y: drawPy };
      });

      // Draw thin lines between nearby orbiting particles to create a digital sky net
      ctx.strokeStyle = "rgba(195, 156, 107, 0.04)"; // Beige trail line
      ctx.lineWidth = 0.8;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(ptCoords[i].x - ptCoords[j].x, ptCoords[i].y - ptCoords[j].y);
          if (d < 65) {
            ctx.beginPath();
            ctx.moveTo(ptCoords[i].x, ptCoords[i].y);
            ctx.lineTo(ptCoords[j].x, ptCoords[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 5. Draw Frequency Bars Radiating Outwards from the Speaker Gourd Logo Contours
      ctx.save();
      
      const drawRadialBarsOnCircle = (
        cx: number,
        cy: number,
        r: number,
        startAngle: number,
        endAngle: number,
        barCountForSec: number,
        useLeft: boolean,
        color: string,
        glowColor: string,
        maxH: number
      ) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";

        const angleRange = endAngle - startAngle;
        const angleStep = angleRange / (barCountForSec - 1);

        for (let i = 0; i < barCountForSec; i++) {
          const angle = startAngle + i * angleStep;
          // Distribute sample index across the lower frequency bands (up to 50%)
          const sampleIndex = Math.floor((i / barCountForSec) * bufferLength * 0.5);
          const value = useLeft ? dataArrayFreqL[sampleIndex] : dataArrayFreqR[sampleIndex];
          
          const barHeight = (value / 255) * maxH;
          if (barHeight < 1.5) continue; // skip flat values

          const xStart = cx + Math.cos(angle) * r;
          const yStart = cy + Math.sin(angle) * r;
          const xEnd = cx + Math.cos(angle) * (r + barHeight);
          const yEnd = cy + Math.sin(angle) * (r + barHeight);

          ctx.beginPath();
          ctx.moveTo(xStart, yStart);
          ctx.lineTo(xEnd, yEnd);
          ctx.stroke();
        }
        ctx.restore();
      };

      // 1. Draw bars around the Main Lower Bulb (32 bars, split L/R channels)
      // Left side: Math.PI / 2 to (Math.PI * 1.5)
      drawRadialBarsOnCircle(
        centerX,
        centerY,
        lowerBulbRad,
        Math.PI * 0.5,
        Math.PI * 1.5,
        16,
        true,
        "#06b6d4",
        "#06b6d4",
        22
      );
      // Right side: -Math.PI / 2 to Math.PI / 2
      drawRadialBarsOnCircle(
        centerX,
        centerY,
        lowerBulbRad,
        -Math.PI * 0.5,
        Math.PI * 0.5,
        16,
        false,
        "#ec4899",
        "#ec4899",
        22
      );

      // 2. Draw bars around the Upper Bulb (20 bars, mids/pink)
      drawRadialBarsOnCircle(
        centerX,
        centerY - baseRadius * 1.25,
        upperBulbRad,
        Math.PI * 1.05,
        Math.PI * 1.95,
        20,
        true,
        "#ec4899",
        "#ec4899",
        18
      );

      // 3. Draw bars around the Top Loop (12 bars, highs/beige)
      drawRadialBarsOnCircle(
        centerX,
        centerY - baseRadius * 2.05,
        topLoopRad,
        Math.PI * 1.1,
        Math.PI * 1.9,
        12,
        false,
        "#c39c6b",
        "#c39c6b",
        12
      );

      ctx.restore();

      // 6. Draw Concentric Circular Stereo Waveforms (Left & Right channels)
      const drawCircularWave = (
        data: Uint8Array,
        color: string,
        glow: string,
        targetRadius: number,
        amplitudeScale: number
      ) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();

        for (let i = 0; i <= bufferLength; i++) {
          const idx = i % bufferLength;
          const v = data[idx] / 128.0;
          const yOffset = v - 1.0;
          
          // Angle maps from 0 to 2*PI
          const angle = (i / bufferLength) * Math.PI * 2;
          
          // Modulate the radius with the time-domain waveform amplitude
          const r = targetRadius + yOffset * 40 * amplitudeScale;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      };

      // Draw Left circular wave (cyan)
      drawCircularWave(dataArrayTimeL, "#06b6d4", "#06b6d4", baseRadius + 38, 0.9);
      // Draw Right circular wave (pink)
      drawCircularWave(dataArrayTimeR, "#ec4899", "#ec4899", baseRadius + 65, 0.9);

      // 7. Draw Circular Centerpiece Visualizer (Radius precalculated above)

      // Glow backdrop for circular plate
      ctx.save();
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius - 15,
        centerX,
        centerY,
        baseRadius + 60
      );
      radialGlow.addColorStop(0, "rgba(139, 92, 246, 0.22)");
      radialGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.06)");
      radialGlow.addColorStop(1, "rgba(10, 11, 16, 0)");
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // DANCING CIRCULAR LEVEL BAR / VU METER RING (Neon Yellow)
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 12;
      
      // Draw level arc starting from top (-PI/2) and spanning based on volumeRatio
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (volumeRatio * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, startAngle, endAngle);
      ctx.stroke();

      // Outer thin reference ring for level gauge
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw Center vinyl disk / record (Opaque to cover waveforms behind it)
      ctx.save();
      ctx.translate(centerX, centerY);

      const diskGrad = ctx.createLinearGradient(-baseRadius, -baseRadius, baseRadius, baseRadius);
      diskGrad.addColorStop(0, "#111827");
      diskGrad.addColorStop(0.5, "#030712");
      diskGrad.addColorStop(1, "#0b0f19");
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer silver ring of record
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner vinyl grooves
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      for (let r = baseRadius - 8; r > 20; r -= 10) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 8. Draw Lissajous Phase Plot inside the vinyl disk center!
      ctx.save();
      // Make Lissajous massive, spanning across the visualizer
      const lissajousRadius = minDim * 0.65;
      ctx.strokeStyle = "rgba(34, 211, 238, 0.65)"; // Neon Cyan vector trace
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#06b6d4";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i < Math.min(bufferLength, 128); i++) {
        const leftVal = (dataArrayTimeL[i] - 128) / 128;
        const rightVal = (dataArrayTimeR[i] - 128) / 128;

        // mid/side 45-degree rotation
        const lx = (leftVal - rightVal) * 0.707;
        const ly = (leftVal + rightVal) * 0.707;

        const posX = lx * lissajousRadius;
        const posY = -ly * lissajousRadius; // canvas invert Y

        if (i === 0) {
          ctx.moveTo(posX, posY);
        } else {
          ctx.lineTo(posX, posY);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Record Center sticker background
      ctx.fillStyle = "#030712";
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Outer sticker silver ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Gold core hole ring
      ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // 8.1. Draw futuristic Record Needle Laser Arm (Noctalia styled)
      ctx.save();
      // Anchor position (top right relative to center)
      const anchorX = baseRadius * 1.25;
      const anchorY = -baseRadius * 1.05;
      
      // Target position on the vinyl record grooves (moving slightly with music volume/time)
      const angleSweep = Math.PI * 0.85 + Math.sin(Date.now() * 0.001) * 0.05;
      const targetR = baseRadius * 0.72 + volumeRatio * 4;
      const targetX = Math.cos(angleSweep) * targetR;
      const targetY = Math.sin(angleSweep) * targetR;

      // Draw anchor base
      ctx.fillStyle = "#c39c6b"; // Beige/Gold anchor
      ctx.strokeStyle = "#06b6d4"; // Cyan glow
      ctx.lineWidth = 1;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#06b6d4";
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw main mechanical arm rod
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      // Bend point in the middle
      const bendX = anchorX - baseRadius * 0.3;
      const bendY = anchorY + baseRadius * 0.5;
      ctx.lineTo(bendX, bendY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Draw Cyan laser emitter head
      ctx.fillStyle = "#06b6d4";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#06b6d4";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw laser reading ray (glowing dot and circular flare under the tip)
      ctx.strokeStyle = "rgba(34, 211, 238, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8 + volumeRatio * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restores center disk translation

      ctx.restore(); // Restores shake translation

      // CRT Scanlines Effect (Retro monitor grid)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Beat-Driven Horizontal Glitch slices
      if (isBeat && Math.random() < 0.38) {
        ctx.save();
        const slices = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = strobeColorRef.current + "0.15)";
        for (let s = 0; s < slices; s++) {
          const sy = Math.random() * canvas.height;
          const sh = Math.random() * 14 + 4;
          const sxShift = (Math.random() - 0.5) * 24; // Horizontal warp offset
          ctx.fillRect(sxShift, sy, canvas.width, sh);
        }
        ctx.restore();
      }

    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [analyser, currentTrack, strobeThreshold]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="waveform-canvas"
    />
  );
};

export default UnifiedVisualizer;
