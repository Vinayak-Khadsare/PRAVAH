'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeHeroSceneProps {
  scrollProgress?: number;
}

export default function ThreeHeroScene({ scrollProgress = 0 }: ThreeHeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const scrollRef = useRef(scrollProgress);

  // Keep scrollRef in sync with prop without re-running useEffect
  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability gracefully
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene & Fog Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f4ec, 0.024);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Accessible reduced motion detection
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Brand Palette Materials (Reused across all wheels for maximum GPU efficiency)
    const matForest = new THREE.MeshStandardMaterial({
      color: 0x234b3c,
      roughness: 0.35,
      metalness: 0.2,
    });

    const matForestDeep = new THREE.MeshStandardMaterial({
      color: 0x0f3826,
      roughness: 0.4,
      metalness: 0.25,
    });

    const matCopper = new THREE.MeshStandardMaterial({
      color: 0xb8734e,
      roughness: 0.22,
      metalness: 0.78,
    });

    const matCopperPolished = new THREE.MeshStandardMaterial({
      color: 0xd6926f,
      roughness: 0.15,
      metalness: 0.85,
    });

    const matIvory = new THREE.MeshStandardMaterial({
      color: 0xf7f4ec,
      roughness: 0.55,
      metalness: 0.05,
    });

    const matPaper = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.02,
    });

    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xe8ede6,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      thickness: 0.4,
    });

    const matGoldWarning = new THREE.MeshStandardMaterial({
      color: 0xb7791f,
      roughness: 0.3,
      metalness: 0.65,
    });

    const matSuccessEmerald = new THREE.MeshStandardMaterial({
      color: 0x397553,
      roughness: 0.25,
      metalness: 0.4,
      emissive: 0x1b4b32,
      emissiveIntensity: 0.35,
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xf7f4ec, 1.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const copperRimLight = new THREE.PointLight(0xb8734e, 3.5, 24);
    copperRimLight.position.set(-6, 2, 6);
    scene.add(copperRimLight);

    const greenFillLight = new THREE.PointLight(0x234b3c, 3.0, 24);
    greenFillLight.position.set(8, -2, 4);
    scene.add(greenFillLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 5 Wheel Positions along the curved 3D pipeline
    const wheelPositions = [
      new THREE.Vector3(-4.8, 0.0, 0.0),   // Wheel 1: Platform Overview
      new THREE.Vector3(-1.4, 0.7, -2.4),  // Wheel 2: Workflow Architecture
      new THREE.Vector3(2.0, -0.4, -4.6),  // Wheel 3: Compliance & EVC
      new THREE.Vector3(5.4, 0.8, -6.8),   // Wheel 4: Pendency Intelligence
      new THREE.Vector3(8.8, 0.1, -8.6),   // Wheel 5: Authorised Outcome
    ];

    // Camera Flight Trajectory Points (Position & Look-At Targets)
    const camPositionPoints = [
      new THREE.Vector3(-3.8, 0.2, 5.2),
      new THREE.Vector3(-0.9, 0.8, 2.9),
      new THREE.Vector3(2.3, -0.3, 0.6),
      new THREE.Vector3(5.6, 0.9, -1.6),
      new THREE.Vector3(8.6, 0.3, -3.4),
    ];

    const camLookAtPoints = [
      new THREE.Vector3(-4.4, 0.0, 0.0),
      new THREE.Vector3(-1.4, 0.65, -2.4),
      new THREE.Vector3(2.0, -0.35, -4.6),
      new THREE.Vector3(5.4, 0.75, -6.8),
      new THREE.Vector3(8.8, 0.1, -8.6),
    ];

    const camPosCurve = new THREE.CatmullRomCurve3(camPositionPoints, false, 'centripetal', 0.5);
    const camLookCurve = new THREE.CatmullRomCurve3(camLookAtPoints, false, 'centripetal', 0.5);

    // Connecting 3D Pipeline Spline
    const pipelineCurve = new THREE.CatmullRomCurve3(wheelPositions, false, 'centripetal', 0.5);

    // Brushed-Copper Conduit Tube
    const tubeGeom = new THREE.TubeGeometry(pipelineCurve, 160, 0.045, 16, false);
    const mainTube = new THREE.Mesh(tubeGeom, matCopper);
    mainTube.castShadow = true;
    mainTube.receiveShadow = true;
    rootGroup.add(mainTube);

    // Frosted Translucent Protective Sleeve
    const sleeveGeom = new THREE.TubeGeometry(pipelineCurve, 160, 0.08, 12, false);
    const sleeve = new THREE.Mesh(sleeveGeom, matGlass);
    rootGroup.add(sleeve);

    // Array to store wheel references for rotation and micro-animations
    const wheels: {
      group: THREE.Group;
      ring: THREE.Mesh;
      motif: THREE.Group;
      spokes: THREE.Group;
      core: THREE.Mesh;
    }[] = [];

    // Helper: Create Spoke Assembly for Information Wheels
    const createSpokeAssembly = (radius: number, spokeCount: number, mat: THREE.Material) => {
      const g = new THREE.Group();
      const spokeGeom = new THREE.CylinderGeometry(0.015, 0.015, radius, 12);
      for (let i = 0; i < spokeCount; i++) {
        const spoke = new THREE.Mesh(spokeGeom, mat);
        const angle = (i * Math.PI * 2) / spokeCount;
        spoke.position.set((Math.cos(angle) * radius) / 2, (Math.sin(angle) * radius) / 2, 0);
        spoke.rotation.z = angle + Math.PI / 2;
        g.add(spoke);
      }
      return g;
    };

    // ==========================================
    // 3D INFORMATION WHEEL 1 — PLATFORM OVERVIEW
    // ==========================================
    const w1Group = new THREE.Group();
    w1Group.position.copy(wheelPositions[0]);

    // Outer Primary Ring
    const w1OuterRingGeom = new THREE.TorusGeometry(1.65, 0.05, 24, 64);
    const w1Ring = new THREE.Mesh(w1OuterRingGeom, matCopper);
    w1Ring.castShadow = true;
    w1Group.add(w1Ring);

    // Inner Forest Ring
    const w1InnerRingGeom = new THREE.TorusGeometry(1.42, 0.035, 20, 64);
    const w1InnerRing = new THREE.Mesh(w1InnerRingGeom, matForest);
    w1Group.add(w1InnerRing);

    // 8 Radial Spokes
    const w1Spokes = createSpokeAssembly(1.42, 8, matCopper);
    w1Group.add(w1Spokes);

    // Glowing Core
    const w1CoreGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const w1CoreMat = new THREE.MeshStandardMaterial({
      color: 0x234b3c,
      emissive: 0x234b3c,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
    const w1Core = new THREE.Mesh(w1CoreGeom, w1CoreMat);
    w1Group.add(w1Core);

    // Central Motif: 3D Application Dossier Binder & Paper Sheets
    const w1Motif = new THREE.Group();
    const binderGeom = new THREE.BoxGeometry(0.7, 0.95, 0.04);
    const binder = new THREE.Mesh(binderGeom, matForestDeep);
    w1Motif.add(binder);

    for (let i = 0; i < 3; i++) {
      const pGeom = new THREE.BoxGeometry(0.64, 0.88, 0.015);
      const paper = new THREE.Mesh(pGeom, matPaper);
      paper.position.set((i - 1) * 0.02, i * 0.02, 0.03 + i * 0.02);
      paper.rotation.z = (i - 1) * 0.04;
      w1Motif.add(paper);
    }
    const clipGeom = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const clip = new THREE.Mesh(clipGeom, matCopperPolished);
    clip.position.set(0.18, 0.44, 0.08);
    w1Motif.add(clip);

    w1Group.add(w1Motif);
    rootGroup.add(w1Group);
    wheels.push({ group: w1Group, ring: w1Ring, motif: w1Motif, spokes: w1Spokes, core: w1Core });

    // ==========================================
    // 3D INFORMATION WHEEL 2 — WORKFLOW ARCHITECTURE
    // ==========================================
    const w2Group = new THREE.Group();
    w2Group.position.copy(wheelPositions[1]);

    const w2OuterRingGeom = new THREE.TorusGeometry(1.7, 0.05, 24, 64);
    const w2Ring = new THREE.Mesh(w2OuterRingGeom, matCopper);
    w2Group.add(w2Ring);

    const w2InnerRingGeom = new THREE.TorusGeometry(1.45, 0.03, 20, 64);
    const w2InnerRing = new THREE.Mesh(w2InnerRingGeom, matForest);
    w2Group.add(w2InnerRing);

    // 5 Circumferential Stage Satellite Nodes
    const w2Spokes = new THREE.Group();
    const stageColors = [matIvory, matCopper, matForest, matGoldWarning, matSuccessEmerald];
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spokeGeom = new THREE.CylinderGeometry(0.015, 0.015, 1.45, 12);
      const spoke = new THREE.Mesh(spokeGeom, matCopper);
      spoke.position.set((Math.cos(angle) * 1.45) / 2, (Math.sin(angle) * 1.45) / 2, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      w2Spokes.add(spoke);

      // Satellite Node Platform
      const satGroup = new THREE.Group();
      satGroup.position.set(Math.cos(angle) * 1.58, Math.sin(angle) * 1.58, 0);

      const satRingGeom = new THREE.TorusGeometry(0.18, 0.02, 16, 24);
      const satRing = new THREE.Mesh(satRingGeom, matCopper);
      satGroup.add(satRing);

      const satSphereGeom = new THREE.SphereGeometry(0.1, 20, 20);
      const satSphere = new THREE.Mesh(satSphereGeom, stageColors[i]);
      satGroup.add(satSphere);

      w2Spokes.add(satGroup);
    }
    w2Group.add(w2Spokes);

    // Core & Central Motif: Scrutiny Optical Gimbal Reticle
    const w2CoreGeom = new THREE.SphereGeometry(0.16, 24, 24);
    const w2CoreMat = new THREE.MeshStandardMaterial({
      color: 0xb8734e,
      emissive: 0xb8734e,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const w2Core = new THREE.Mesh(w2CoreGeom, w2CoreMat);
    w2Group.add(w2Core);

    const w2Motif = new THREE.Group();
    const g1Geom = new THREE.TorusGeometry(0.48, 0.022, 16, 32);
    const g1 = new THREE.Mesh(g1Geom, matForest);
    w2Motif.add(g1);

    const g2Geom = new THREE.TorusGeometry(0.36, 0.018, 16, 32);
    const g2 = new THREE.Mesh(g2Geom, matCopper);
    g2.rotation.x = Math.PI / 3;
    w2Motif.add(g2);

    const lensGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32);
    const lens = new THREE.Mesh(lensGeom, matGlass);
    lens.rotation.x = Math.PI / 2;
    w2Motif.add(lens);

    w2Group.add(w2Motif);
    rootGroup.add(w2Group);
    wheels.push({ group: w2Group, ring: w2Ring, motif: w2Motif, spokes: w2Spokes, core: w2Core });

    // ==========================================
    // 3D INFORMATION WHEEL 3 — COMPLIANCE & EVC INSPECTION
    // ==========================================
    const w3Group = new THREE.Group();
    w3Group.position.copy(wheelPositions[2]);

    const w3OuterRingGeom = new THREE.TorusGeometry(1.7, 0.05, 24, 64);
    const w3Ring = new THREE.Mesh(w3OuterRingGeom, matCopper);
    w3Group.add(w3Ring);

    const w3InnerRingGeom = new THREE.TorusGeometry(1.42, 0.03, 20, 64);
    const w3InnerRing = new THREE.Mesh(w3InnerRingGeom, matForestDeep);
    w3Group.add(w3InnerRing);

    const w3Spokes = createSpokeAssembly(1.42, 12, matCopper);
    w3Group.add(w3Spokes);

    const w3CoreGeom = new THREE.SphereGeometry(0.17, 24, 24);
    const w3CoreMat = new THREE.MeshStandardMaterial({
      color: 0x234b3c,
      emissive: 0x397553,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
    const w3Core = new THREE.Mesh(w3CoreGeom, w3CoreMat);
    w3Group.add(w3Core);

    // Central Motif: Classical Tripartite EVC Campus Colonnade & Calendar Plaque
    const w3Motif = new THREE.Group();

    const colonnadeBase = new THREE.BoxGeometry(0.72, 0.05, 0.3);
    const cBaseMesh = new THREE.Mesh(colonnadeBase, matIvory);
    cBaseMesh.position.y = -0.32;
    w3Motif.add(cBaseMesh);

    const pillarGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.52, 16);
    [-0.26, 0.0, 0.26].forEach((xPos) => {
      const p = new THREE.Mesh(pillarGeom, matCopper);
      p.position.set(xPos, -0.06, 0);
      w3Motif.add(p);
    });

    const entablatureGeom = new THREE.BoxGeometry(0.76, 0.07, 0.32);
    const entablature = new THREE.Mesh(entablatureGeom, matForest);
    entablature.position.y = 0.22;
    w3Motif.add(entablature);

    const compassGeom = new THREE.ConeGeometry(0.07, 0.18, 16);
    const compass = new THREE.Mesh(compassGeom, matCopperPolished);
    compass.position.set(0, 0.35, 0);
    w3Motif.add(compass);

    // Floating 30-year Lease Deed Scrolls on sides
    const scrollGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.38, 20);
    const scrollL = new THREE.Mesh(scrollGeom, matPaper);
    scrollL.position.set(-0.54, 0.05, 0.08);
    scrollL.rotation.z = 0.3;
    w3Motif.add(scrollL);

    const scrollR = new THREE.Mesh(scrollGeom, matPaper);
    scrollR.position.set(0.54, 0.05, 0.08);
    scrollR.rotation.z = -0.3;
    w3Motif.add(scrollR);

    w3Group.add(w3Motif);
    rootGroup.add(w3Group);
    wheels.push({ group: w3Group, ring: w3Ring, motif: w3Motif, spokes: w3Spokes, core: w3Core });

    // ==========================================
    // 3D INFORMATION WHEEL 4 — PENDENCY INTELLIGENCE
    // ==========================================
    const w4Group = new THREE.Group();
    w4Group.position.copy(wheelPositions[3]);

    // Faceted Data Ring (Octagonal feel)
    const w4OuterRingGeom = new THREE.TorusGeometry(1.68, 0.05, 8, 64);
    const w4Ring = new THREE.Mesh(w4OuterRingGeom, matCopper);
    w4Group.add(w4Ring);

    const w4InnerRingGeom = new THREE.TorusGeometry(1.42, 0.03, 16, 64);
    const w4InnerRing = new THREE.Mesh(w4InnerRingGeom, matGoldWarning);
    w4Group.add(w4InnerRing);

    const w4Spokes = createSpokeAssembly(1.42, 6, matCopper);
    w4Group.add(w4Spokes);

    const w4CoreGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const w4CoreMat = new THREE.MeshStandardMaterial({
      color: 0xb7791f,
      emissive: 0xb7791f,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const w4Core = new THREE.Mesh(w4CoreGeom, w4CoreMat);
    w4Group.add(w4Core);

    // Central Motif: Statutory Blocker Reticle & Diagnostic Scales
    const w4Motif = new THREE.Group();

    const fulcrumGeom = new THREE.CylinderGeometry(0.06, 0.09, 0.48, 16);
    const fulcrum = new THREE.Mesh(fulcrumGeom, matCopper);
    w4Motif.add(fulcrum);

    const balanceBeamGeom = new THREE.BoxGeometry(0.75, 0.04, 0.04);
    const balanceBeam = new THREE.Mesh(balanceBeamGeom, matForest);
    balanceBeam.position.y = 0.24;
    w4Motif.add(balanceBeam);

    const discGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 24);
    const leftDisc = new THREE.Mesh(discGeom, matIvory);
    leftDisc.position.set(-0.32, 0.15, 0);
    w4Motif.add(leftDisc);

    const rightDisc = new THREE.Mesh(discGeom, matIvory);
    rightDisc.position.set(0.32, 0.15, 0);
    w4Motif.add(rightDisc);

    w4Group.add(w4Motif);
    rootGroup.add(w4Group);
    wheels.push({ group: w4Group, ring: w4Ring, motif: w4Motif, spokes: w4Spokes, core: w4Core });

    // ==========================================
    // 3D INFORMATION WHEEL 5 — FINAL AUTHORISED OUTCOME
    // ==========================================
    const w5Group = new THREE.Group();
    w5Group.position.copy(wheelPositions[4]);

    const w5OuterRingGeom = new THREE.TorusGeometry(1.75, 0.06, 24, 64);
    const w5Ring = new THREE.Mesh(w5OuterRingGeom, matCopperPolished);
    w5Group.add(w5Ring);

    const w5InnerRingGeom = new THREE.TorusGeometry(1.48, 0.04, 20, 64);
    const w5InnerRing = new THREE.Mesh(w5InnerRingGeom, matSuccessEmerald);
    w5Group.add(w5InnerRing);

    const w5Spokes = createSpokeAssembly(1.48, 16, matCopper);
    w5Group.add(w5Spokes);

    const w5CoreGeom = new THREE.SphereGeometry(0.2, 24, 24);
    const w5CoreMat = new THREE.MeshStandardMaterial({
      color: 0x397553,
      emissive: 0x397553,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });
    const w5Core = new THREE.Mesh(w5CoreGeom, w5CoreMat);
    w5Group.add(w5Core);

    // Central Motif: Grand AICTE Council Seal & Rosette Medallion
    const w5Motif = new THREE.Group();

    const sealBaseGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.06, 32);
    sealBaseGeom.rotateX(Math.PI / 2);
    const sealBase = new THREE.Mesh(sealBaseGeom, matForestDeep);
    w5Motif.add(sealBase);

    const sealRimGeom = new THREE.TorusGeometry(0.42, 0.035, 16, 32);
    const sealRim = new THREE.Mesh(sealRimGeom, matCopperPolished);
    w5Motif.add(sealRim);

    // 8-Point Star Medallion Emblem
    const starGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.03, 8);
    starGeom.rotateX(Math.PI / 2);
    const starMedal = new THREE.Mesh(starGeom, matCopperPolished);
    starMedal.position.z = 0.035;
    w5Motif.add(starMedal);

    // Dual Statutory Ribbons
    const ribbonGeom = new THREE.BoxGeometry(0.14, 0.38, 0.015);
    const ribbonL = new THREE.Mesh(ribbonGeom, matCopper);
    ribbonL.position.set(-0.15, -0.48, -0.02);
    ribbonL.rotation.z = 0.28;
    w5Motif.add(ribbonL);

    const ribbonR = new THREE.Mesh(ribbonGeom, matCopper);
    ribbonR.position.set(0.15, -0.48, -0.02);
    ribbonR.rotation.z = -0.28;
    w5Motif.add(ribbonR);

    w5Group.add(w5Motif);
    rootGroup.add(w5Group);
    wheels.push({ group: w5Group, ring: w5Ring, motif: w5Motif, spokes: w5Spokes, core: w5Core });

    // ==========================================
    // TRAVELING APPLICATION CAPSULES
    // ==========================================
    const packetOffsets = [0.05, 0.22, 0.42, 0.62, 0.82];
    const packetMeshes: THREE.Group[] = [];

    packetOffsets.forEach((offset, idx) => {
      const pGroup = new THREE.Group();

      const envGeom = new THREE.BoxGeometry(0.2, 0.15, 0.035);
      const env = new THREE.Mesh(envGeom, idx % 2 === 0 ? matPaper : matIvory);
      pGroup.add(env);

      const stampGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
      stampGeom.rotateX(Math.PI / 2);
      const stamp = new THREE.Mesh(stampGeom, matCopperPolished);
      stamp.position.set(0.04, 0.02, 0.02);
      pGroup.add(stamp);

      const glowGeom = new THREE.SphereGeometry(0.065, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: idx === 4 ? 0x397553 : idx === 3 ? 0xb7791f : 0xb8734e,
        transparent: true,
        opacity: 0.8,
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.set(0, 0, 0.02);
      pGroup.add(glow);

      rootGroup.add(pGroup);
      packetMeshes.push(pGroup);
    });

    // ==========================================
    // AMBIENT ATMOSPHERIC DUST PARTICLES
    // ==========================================
    const particleCount = 70;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xb8734e,
      size: 0.045,
      transparent: true,
      opacity: 0.4,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    rootGroup.add(particleSystem);

    // ==========================================
    // RESIZE HANDLER
    // ==========================================
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // CONTINUOUS RENDER LOOP (SCROLL + AMBIENT INTERPOLATION)
    // ==========================================
    const clock = new THREE.Clock();
    let animationFrameId: number;
    let smoothedProgress = scrollRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smoothly interpolate current camera journey progress toward target scrollProgress
      const targetProgress = Math.max(0, Math.min(1, scrollRef.current));
      smoothedProgress += (targetProgress - smoothedProgress) * (prefersReducedMotion ? 1.0 : 0.08);

      // 1. Camera Spline Traversal
      if (!prefersReducedMotion) {
        const clampedT = Math.max(0.001, Math.min(0.999, smoothedProgress));
        const camPos = camPosCurve.getPointAt(clampedT);
        const camLook = camLookCurve.getPointAt(clampedT);

        // Add subtle cinematic breathing to camera
        const swayX = Math.sin(elapsedTime * 0.15) * 0.08;
        const swayY = Math.cos(elapsedTime * 0.2) * 0.05;

        camera.position.set(camPos.x + swayX, camPos.y + swayY, camPos.z);
        camera.lookAt(camLook);
      } else {
        // Simplified stationary camera for reduced motion
        const clampedT = Math.max(0.001, Math.min(0.999, smoothedProgress));
        const camPos = camPosCurve.getPointAt(clampedT);
        const camLook = camLookCurve.getPointAt(clampedT);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
      }

      // 2. Wheel Rotation & Activity
      wheels.forEach((w, idx) => {
        // Scroll-driven rotation + continuous ambient rotation
        const wheelAngle = smoothedProgress * Math.PI * 2.5 * (idx % 2 === 0 ? 1 : -1) + elapsedTime * 0.12 * (idx % 2 === 0 ? 1 : -1);
        w.spokes.rotation.z = wheelAngle;

        // Core gentle pulse
        const pulse = Math.sin(elapsedTime * 2.0 + idx * 1.2);
        const coreScale = 1.0 + pulse * 0.07;
        w.core.scale.set(coreScale, coreScale, coreScale);

        // Motif micro-animations
        if (idx === 0) {
          w.motif.position.y = Math.sin(elapsedTime * 1.5) * 0.02;
        } else if (idx === 1) {
          w.motif.children[0].rotation.y = elapsedTime * 0.35;
          w.motif.children[1].rotation.x = -elapsedTime * 0.3;
        } else if (idx === 2) {
          w.motif.position.y = Math.sin(elapsedTime * 1.2) * 0.015;
        } else if (idx === 3) {
          w.motif.children[1].rotation.z = Math.sin(elapsedTime * 1.4) * 0.08;
        } else if (idx === 4) {
          w.motif.children[1].rotation.z = elapsedTime * 0.2;
          w.motif.children[2].rotation.z = -elapsedTime * 0.15;
        }
      });

      // 3. Traveling Application Dossier Packets
      const packetSpeed = 0.035;
      packetMeshes.forEach((mesh, i) => {
        const t = (elapsedTime * packetSpeed + packetOffsets[i]) % 1.0;
        const pt = pipelineCurve.getPointAt(t);
        const tangent = pipelineCurve.getTangentAt(t);

        mesh.position.copy(pt);
        mesh.position.y += 0.06;
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      });

      // 4. Ambient Dust Motes Drift
      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let px = posAttr.getX(i) + particleVelocities[i].x;
        let py = posAttr.getY(i) + particleVelocities[i].y;
        let pz = posAttr.getZ(i) + particleVelocities[i].z;

        if (px > 11) px = -11;
        if (px < -11) px = 11;
        if (py > 4) py = -4;
        if (py < -4) py = 4;
        if (pz > 4) pz = -14;
        if (pz < -14) pz = 4;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // RESOURCE CLEANUP ON UNMOUNT
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      tubeGeom.dispose();
      sleeveGeom.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();

      wheels.forEach((w) => {
        w.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });
      });

      packetMeshes.forEach((p) => {
        p.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          }
        });
      });

      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-brand-ivory text-brand-charcoal text-center">
        <div className="w-12 h-12 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest mb-4 border border-brand-border">
          <span className="material-symbols-outlined text-[24px]">account_tree</span>
        </div>
        <h3 className="text-lg font-bold font-mono tracking-tight text-brand-forest">
          PRAVAH 5-STAGE APPROVAL WORKFLOW
        </h3>
        <p className="text-xs text-brand-charcoal/70 max-w-md mt-1">
          Submission → Scrutiny & Verification → EVC Inspection → SAC/SHC Hearing → Authorised Decision
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-label="Cinematic 3D Information Wheels & Approval Pipeline"
      role="img"
    />
  );
}
