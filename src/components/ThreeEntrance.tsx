import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "@/lib/sound";

interface ThreeEntranceProps {
  onComplete: () => void;
}

export default function ThreeEntrance({ onComplete }: ThreeEntranceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080c, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x1a1a24, 1.2);
    scene.add(ambientLight);

    const emberLight = new THREE.PointLight(0xff5a1f, 4, 15);
    emberLight.position.set(0, 0, 2);
    scene.add(emberLight);

    const violetLight = new THREE.PointLight(0x8b7cff, 2.5, 15);
    violetLight.position.set(-3, 3, -2);
    scene.add(violetLight);

    const rimLight = new THREE.DirectionalLight(0xff8a5b, 1.5);
    rimLight.position.set(3, -2, 4);
    scene.add(rimLight);

    // --- 3D GEOMETRY: THE CORE OF FOCUS ---
    const group = new THREE.Group();
    scene.add(group);

    // 1. Outer Icosahedron Wireframe Cage
    const outerGeo = new THREE.IcosahedronGeometry(2, 0);
    const wireframeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a4c,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x1f1b2e,
      emissiveIntensity: 0.4,
    });
    const outerMesh = new THREE.Mesh(outerGeo, wireframeMat);
    group.add(outerMesh);

    // 2. Inner Glowing Core (Octahedron Ember)
    const innerGeo = new THREE.OctahedronGeometry(1.05, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xff3b00,
      emissiveIntensity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, coreMat);
    group.add(innerMesh);

    // 3. Inner Point Light inside the Core
    const coreGlow = new THREE.PointLight(0xff7733, 5, 8);
    group.add(coreGlow);

    // 4. Orbiting Rings
    const ringGeo1 = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.0, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b7cff, transparent: true, opacity: 0.45 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // 5. Floating Ember Particles
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    // Particle Canvas Texture for glowing dots
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 160, 100, 1)");
      grad.addColorStop(0.3, "rgba(255, 90, 31, 0.8)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- MOUSE PARALLAX HANDLER ---
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- ANIMATION LOOP ---
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Group rotation
      group.rotation.x = elapsedTime * 0.35 + mouseRef.current.y * 0.3;
      group.rotation.y = elapsedTime * 0.45 + mouseRef.current.x * 0.4;

      // Subtle breathing pulse for inner core
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.06;
      innerMesh.scale.set(pulse, pulse, pulse);
      coreGlow.intensity = 4 + Math.sin(elapsedTime * 4) * 2;

      // Rings orbit
      ring1.rotation.z = elapsedTime * 0.6;
      ring2.rotation.x = -elapsedTime * 0.5;

      // Swirling particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i];
        positions[i * 3 + 1] += Math.sin(elapsedTime * speed + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.1;

      // Camera drift
      camera.position.x = mouseRef.current.x * 0.4;
      camera.position.y = mouseRef.current.y * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      outerGeo.dispose();
      innerGeo.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      wireframeMat.dispose();
      coreMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Progress counter simulation with realistic progression
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const delta = Math.floor(Math.random() * 14) + 6;
        return Math.min(100, prev + delta);
      });
    }, 110);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    sound.playLevelUp();
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  // Auto-enter after completing progress + brief moment for 3D showcase
  useEffect(() => {
    if (progress === 100) {
      const autoTimeout = setTimeout(() => {
        handleEnter();
      }, 700);
      return () => clearTimeout(autoTimeout);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 1.08 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-[#08080C] flex flex-col items-center justify-between select-none overflow-hidden"
      >
        {/* Background Radial Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,90,31,0.12)_0%,rgba(139,124,255,0.06)_40%,rgba(8,8,12,0.95)_75%)]" />

        {/* 3D WebGL Canvas Container */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-[760px] p-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
            <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#A1A1AE]">
              NÚCLEO ACTIVO
            </span>
          </div>
          <button
            onClick={handleEnter}
            className="text-xs font-bold text-[#A1A1AE] hover:text-[#FF5A1F] transition-colors uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[#262631] bg-[#111117]/80 backdrop-blur-md cursor-pointer hover:border-[#FF5A1F]/50"
          >
            Omitir
          </button>
        </motion.div>

        {/* Center Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-4 pointer-events-none"
        >
          <div className="relative mb-2">
            <h1 className="text-5xl sm:text-7xl font-black text-[#F5F5F7] tracking-[0.25em] uppercase font-display drop-shadow-[0_0_35px_rgba(255,90,31,0.45)]">
              FOCUS
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-black tracking-[0.35em] uppercase text-[#FF5A1F] mt-1 drop-shadow-sm">
            DISCIPLINA · ENFOQUE · PODER
          </p>
        </motion.div>

        {/* Bottom Loading Progress & Trigger */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 w-full max-w-sm px-6 pb-12 flex flex-col items-center gap-3.5"
        >
          <div className="w-full flex items-center justify-between text-[11px] font-bold tracking-widest uppercase">
            <span className="text-[#A1A1AE]">
              {progress < 100 ? "FORJANDO ENTORNO..." : "SISTEMA LISTO"}
            </span>
            <span className="text-[#FF5A1F] font-mono tabular-nums">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-[#16161E] rounded-full overflow-hidden border border-[#262631]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF5A1F] via-[#FF8A5B] to-[#8B7CFF] rounded-full shadow-[0_0_12px_#FF5A1F]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          {progress >= 100 && (
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEnter}
              className="w-full mt-2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-[#FF5A1F] text-[#08080C] shadow-lg shadow-[#FF5A1F]/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <span>Entrar al Santuario</span>
              <span className="text-base font-bold">→</span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
