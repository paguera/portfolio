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
  const strobeColorRef = useRef<string>("hsla(45, 100%, 55%, ");
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

    const fftSize = 512;
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

    // Setup background particles (warm gold, cyber yellow, cyber purple, coral)
    if (backgroundParticles.current.length === 0) {
      for (let i = 0; i < 45; i++) {
        const rand = Math.random();
        backgroundParticles.current.push({
          x: Math.random() * 320 + 40,
          y: Math.random() * Math.PI * 2,
          vx: (Math.random() * 0.002 + 0.0006) * (Math.random() > 0.5 ? 1 : -1),
          vy: 0,
          alpha: Math.random() * 0.45 + 0.1,
          size: Math.random() * 1.8 + 0.8,
          color: rand > 0.7 ? "#c39c6b" : (rand > 0.45 ? "#fbbf24" : (rand > 0.2 ? "#8b5cf6" : "#ec4899")),
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
        backgroundParticles.current.forEach(p => {
          p.x = Math.random() * (Math.min(width, height) * 0.75) + 30;
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
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
      const volumeRatio = averageVolume / 255;

      // Frequency bands ratios
      const bassRatio = (dataArrayFreqL[3] || 0) / 255;
      const midRatio = (dataArrayFreqL[13] || 0) / 255;
      const highRatio = (dataArrayFreqL[26] || 0) / 255;

      // 2. Clear canvas with dark slate afterglow effect
      ctx.fillStyle = "rgba(24, 26, 32, 0.24)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // BEAT STROBE FLASH (Warm Amber / Gold / Cyber Yellow / Purple hues - no blue)
      const isBeat = volumeRatio > strobeThreshold;
      if (isBeat) {
        if (!wasBeatRef.current) {
          const hues = [45, 35, 275, 330, 20, 50]; // Yellow, amber, purple, magenta, orange, gold
          const randomHue = hues[Math.floor(Math.random() * hues.length)];
          strobeColorRef.current = `hsla(${randomHue}, 95%, 55%, `;
        }
        ctx.save();
        ctx.fillStyle = strobeColorRef.current + `${0.04 + (volumeRatio - strobeThreshold) * 0.35})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      wasBeatRef.current = isBeat;

      // Dynamic screen shake on strong beats
      const shakeAmplitude = isBeat ? (volumeRatio - strobeThreshold) * 35 : 0;
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

      // 3. Cyber Grid & Tech Geometric Elements (Cyber Yellow / Violet)
      ctx.save();
      ctx.strokeStyle = isBeat
        ? strobeColorRef.current + `${0.08 + volumeRatio * 0.12})`
        : `rgba(251, 191, 36, ${0.02 + volumeRatio * 0.04})`;
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

      // 3.1. Grid Mesh of Audio-Reactive Waveforms warping around logo contours
      const warpPointAroundLogo = (x: number, y: number) => {
        let wx = x;
        let wy = y;
        const circles = [
          { cx: centerX, cy: centerY - baseRadius * 2.05, r: baseRadius * 0.24 },
          { cx: centerX, cy: centerY - baseRadius * 1.25, r: baseRadius * 0.74 },
          { cx: centerX, cy: centerY, r: baseRadius * 1.07 }
        ];
        for (const c of circles) {
          const dx = wx - c.cx;
          const dy = wy - c.cy;
          const dist = Math.hypot(dx, dy);
          const avoidDist = c.r + 12;
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
          const yOffset = v - 1.0;
          const x = i * sliceHeight;
          const y = xCenter + yOffset * 22 * Math.sin((i / bufferLength) * Math.PI);
          const warped = warpPointAroundLogo(x, y);

          if (i === 0) ctx.moveTo(warped.x, warped.y);
          else ctx.lineTo(warped.x, warped.y);
        }
        ctx.stroke();
        ctx.restore();
      };

      // Cyber Yellow, Purple, Warm Gold & Amber waveforms
      drawMeshWaveHorizontal(canvas.height * 0.2, dataArrayTimeL, "#fbbf24"); // Yellow
      drawMeshWaveHorizontal(canvas.height * 0.4, dataArrayTimeR, "#8b5cf6"); // Purple
      drawMeshWaveHorizontal(canvas.height * 0.6, dataArrayTimeL, "#ec4899"); // Coral
      drawMeshWaveHorizontal(canvas.height * 0.8, dataArrayTimeR, "#f59e0b"); // Amber

      drawMeshWaveVertical(canvas.width * 0.2, dataArrayTimeR, "#8b5cf6"); // Purple
      drawMeshWaveVertical(canvas.width * 0.4, dataArrayTimeL, "#fbbf24"); // Yellow
      drawMeshWaveVertical(canvas.width * 0.6, dataArrayTimeR, "#f59e0b"); // Amber
      drawMeshWaveVertical(canvas.width * 0.8, dataArrayTimeL, "#ec4899"); // Coral

      // Tech Concentric Rings (Gold & Amber accents)
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.04 + volumeRatio * 0.06})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.55, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(195, 156, 107, ${0.06 + volumeRatio * 0.08})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- SPIRALES INFERNALES (Yellow & Purple) ---
      ctx.save();
      const spiralRot = rotationRef.current * 1.5;
      const maxSpiralAngle = 8 * Math.PI;
      const spiralStep = 0.08;
      
      // Spiral 1: Cyber Purple
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 + volumeRatio * 0.16})`;
      ctx.shadowColor = "#8b5cf6";
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

      // Spiral 2: Cyber Yellow
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.06 + volumeRatio * 0.16})`;
      ctx.shadowColor = "#fbbf24";
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

      // --- LOGO SILHOUETTE ---
      ctx.save();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`;
      ctx.shadowColor = "#c39c6b";
      ctx.shadowBlur = 8 + volumeRatio * 12;
      ctx.lineWidth = 1.6;

      // 1. Top Carrying Loop / Handle
      if (highRatio > 0.6) {
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.shadowColor = "#fbbf24";
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 2.05, topLoopRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 2.05, topInnerRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`;
      ctx.shadowColor = "#c39c6b";

      // 2. Upper Bulb / Chamber
      if (midRatio > 0.6) {
        ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
        ctx.shadowColor = "#8b5cf6";
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY - baseRadius * 1.25, upperBulbRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.08 + volumeRatio * 0.15})`;
      ctx.shadowColor = "#c39c6b";

      // 3. Lower Bulb / Chamber
      ctx.beginPath();
      ctx.arc(centerX, centerY, lowerBulbRad, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Two feet at bottom
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      const feetDisplacement = baseRadius * (0.55 + bassRatio * 0.05);
      ctx.beginPath();
      ctx.arc(centerX - feetDisplacement, centerY + baseRadius * 0.9, baseRadius * 0.12, Math.PI * 0.7, Math.PI * 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + feetDisplacement, centerY + baseRadius * 0.9, baseRadius * 0.12, Math.PI * 1.8, Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();

      // Speaker surround ring with 6 screws
      ctx.save();
      ctx.strokeStyle = `rgba(195, 156, 107, ${0.12 + volumeRatio * 0.15})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(251, 191, 36, ${0.35 + volumeRatio * 0.45})`;
      ctx.shadowColor = "#fbbf24";
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

      // Outer background slow rotating octagon
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

      // Cyber Corner brackets (Cyber Yellow)
      const bracketSize = 14;
      const bracketMargin = 12;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(bracketMargin + bracketSize, bracketMargin);
      ctx.lineTo(bracketMargin, bracketMargin);
      ctx.lineTo(bracketMargin, bracketMargin + bracketSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width - bracketMargin - bracketSize, bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, bracketMargin + bracketSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bracketMargin + bracketSize, canvas.height - bracketMargin);
      ctx.lineTo(bracketMargin, canvas.height - bracketMargin);
      ctx.lineTo(bracketMargin, canvas.height - bracketMargin - bracketSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width - bracketMargin - bracketSize, canvas.height - bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, canvas.height - bracketMargin);
      ctx.lineTo(canvas.width - bracketMargin, canvas.height - bracketMargin - bracketSize);
      ctx.stroke();

      ctx.restore();

      // 4. Background Constellation Particles
      ctx.save();
      const pts = backgroundParticles.current;
      const ptCoords = pts.map(p => {
        p.y += p.vx * (1 + volumeRatio * 1.6);
        const px = centerX + Math.cos(p.y) * p.x;
        const py = centerY + Math.sin(p.y) * p.x;

        let drawPx = px;
        let drawPy = py;
        if (mouseRef.current.active) {
          const dx = px - mouseRef.current.x;
          const dy = py - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            const pullForce = (130 - dist) / 130;
            drawPx -= (dx / dist) * pullForce * 20;
            drawPy -= (dy / dist) * pullForce * 20;
          }
        }

        const twinkleFactor = Math.sin(Date.now() * 0.005 + p.x) * 0.08;
        const finalAlpha = Math.max(0.08, Math.min(p.alpha + twinkleFactor, 0.9));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = finalAlpha * (0.6 + volumeRatio * 0.4);
        ctx.beginPath();
        ctx.arc(drawPx, drawPy, p.size, 0, Math.PI * 2);
        ctx.fill();

        return { x: drawPx, y: drawPy };
      });

      ctx.strokeStyle = "rgba(195, 156, 107, 0.04)";
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

      // 5. Frequency Bars Radiating Outwards
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
          const sampleIndex = Math.floor((i / barCountForSec) * bufferLength * 0.5);
          const value = useLeft ? dataArrayFreqL[sampleIndex] : dataArrayFreqR[sampleIndex];
          
          const barHeight = (value / 255) * maxH;
          if (barHeight < 1.5) continue;

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

      // Lower bulb: Left = Cyber Yellow, Right = Cyber Purple
      drawRadialBarsOnCircle(
        centerX,
        centerY,
        lowerBulbRad,
        Math.PI * 0.5,
        Math.PI * 1.5,
        16,
        true,
        "#fbbf24",
        "#fbbf24",
        22
      );
      drawRadialBarsOnCircle(
        centerX,
        centerY,
        lowerBulbRad,
        -Math.PI * 0.5,
        Math.PI * 0.5,
        16,
        false,
        "#8b5cf6",
        "#8b5cf6",
        22
      );

      // Upper bulb: Warm Amber
      drawRadialBarsOnCircle(
        centerX,
        centerY - baseRadius * 1.25,
        upperBulbRad,
        Math.PI * 1.05,
        Math.PI * 1.95,
        20,
        true,
        "#f59e0b",
        "#f59e0b",
        18
      );

      // Top loop: Gold
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

      // 6. Concentric Circular Stereo Waveforms (Yellow & Purple)
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
          const angle = (i / bufferLength) * Math.PI * 2;
          const r = targetRadius + yOffset * 40 * amplitudeScale;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };

      // Left circular wave (Cyber Yellow)
      drawCircularWave(dataArrayTimeL, "#fbbf24", "#fbbf24", baseRadius + 38, 0.9);
      // Right circular wave (Cyber Purple)
      drawCircularWave(dataArrayTimeR, "#8b5cf6", "#8b5cf6", baseRadius + 65, 0.9);

      // 7. Centerpiece Visualizer Plate
      ctx.save();
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius - 15,
        centerX,
        centerY,
        baseRadius + 60
      );
      radialGlow.addColorStop(0, "rgba(251, 191, 36, 0.15)");
      radialGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.06)");
      radialGlow.addColorStop(1, "rgba(24, 26, 32, 0)");
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // DANCING CIRCULAR VU METER RING (Cyber Yellow)
      ctx.save();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 12;
      
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (volumeRatio * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, startAngle, endAngle);
      ctx.stroke();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Center vinyl disk
      ctx.save();
      ctx.translate(centerX, centerY);

      const diskGrad = ctx.createLinearGradient(-baseRadius, -baseRadius, baseRadius, baseRadius);
      diskGrad.addColorStop(0, "#252831");
      diskGrad.addColorStop(0.5, "#181a20");
      diskGrad.addColorStop(1, "#121316");
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Vinyl outer ring
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

      // 8. Lissajous Phase Plot inside the vinyl disk center (Cyber Yellow / Amber)
      ctx.save();
      const lissajousRadius = minDim * 0.65;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.75)";
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#fbbf24";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i < Math.min(bufferLength, 128); i++) {
        const leftVal = (dataArrayTimeL[i] - 128) / 128;
        const rightVal = (dataArrayTimeR[i] - 128) / 128;

        const lx = (leftVal - rightVal) * 0.707;
        const ly = (leftVal + rightVal) * 0.707;

        const posX = lx * lissajousRadius;
        const posY = -ly * lissajousRadius;

        if (i === 0) ctx.moveTo(posX, posY);
        else ctx.lineTo(posX, posY);
      }
      ctx.stroke();
      ctx.restore();

      // Record Center sticker
      ctx.fillStyle = "#181a20";
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // 8.1. Record Needle Laser Arm (Yellow / Amber laser)
      ctx.save();
      const anchorX = baseRadius * 1.25;
      const anchorY = -baseRadius * 1.05;
      
      const angleSweep = Math.PI * 0.85 + Math.sin(Date.now() * 0.001) * 0.05;
      const targetR = baseRadius * 0.72 + volumeRatio * 4;
      const targetX = Math.cos(angleSweep) * targetR;
      const targetY = Math.sin(angleSweep) * targetR;

      // Draw anchor base
      ctx.fillStyle = "#c39c6b";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#fbbf24";
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Main mechanical arm rod
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      const bendX = anchorX - baseRadius * 0.3;
      const bendY = anchorY + baseRadius * 0.5;
      ctx.lineTo(bendX, bendY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Laser emitter head (Cyber Yellow)
      ctx.fillStyle = "#fbbf24";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#fbbf24";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Laser reading ray
      ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8 + volumeRatio * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      ctx.restore();

      // CRT Scanlines Effect
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

      // Beat-Driven Horizontal Glitch slices (Warm Amber/Yellow)
      if (isBeat && Math.random() < 0.38) {
        ctx.save();
        const slices = Math.floor(Math.random() * 3) + 1;
        ctx.fillStyle = strobeColorRef.current + "0.15)";
        for (let s = 0; s < slices; s++) {
          const sy = Math.random() * canvas.height;
          const sh = Math.random() * 14 + 4;
          const sxShift = (Math.random() - 0.5) * 24;
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
