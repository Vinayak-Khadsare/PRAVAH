'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting directly from Stitch
    const ambientLight = new THREE.AmbientLight(0xf7f4ec, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 8, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const copperFillLight = new THREE.PointLight(0xb8734e, 2.5, 15);
    copperFillLight.position.set(-4, -2, 3);
    scene.add(copperFillLight);

    const greenAccentLight = new THREE.PointLight(0x234b3c, 3.0, 15);
    greenAccentLight.position.set(3, -3, 2);
    scene.add(greenAccentLight);

    // Group container
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Materials
    const matDossierFront = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 40,
      specular: 0x234b3c,
    });

    const matDossierCover = new THREE.MeshPhongMaterial({
      color: 0x234b3c,
      shininess: 30,
    });

    const matGlass = new THREE.MeshPhongMaterial({
      color: 0xf5fbf4,
      transparent: true,
      opacity: 0.75,
      shininess: 90,
      reflectivity: 0.8,
    });

    const matCopper = new THREE.MeshPhongMaterial({
      color: 0xb8734e,
      shininess: 80,
      specular: 0xffd2b8,
    });

    const matNodeActive = new THREE.MeshPhongMaterial({
      color: 0x234b3c,
      shininess: 60,
    });

    const matNodeWarning = new THREE.MeshPhongMaterial({
      color: 0xb7791f,
      shininess: 60,
    });

    const matNodeSuccess = new THREE.MeshPhongMaterial({
      color: 0x397553,
      shininess: 60,
    });

    const matLine = new THREE.LineBasicMaterial({
      color: 0xb8734e,
      transparent: true,
      opacity: 0.65,
      linewidth: 2,
    });

    // 1. Layered Application Dossier (The Core Approval Case)
    const dossierGroup = new THREE.Group();
    mainGroup.add(dossierGroup);

    // Main dossier binder back
    const binderGeom = new THREE.BoxGeometry(2.8, 3.8, 0.12);
    const binder = new THREE.Mesh(binderGeom, matDossierCover);
    binder.position.set(0, 0, -0.1);
    dossierGroup.add(binder);

    // Paper sheets stack
    const paperCount = 4;
    for (let i = 0; i < paperCount; i++) {
      const paperGeom = new THREE.BoxGeometry(2.65, 3.65, 0.02);
      const paper = new THREE.Mesh(paperGeom, matDossierFront);
      paper.position.set(0.04 * (i % 2 === 0 ? 1 : -1), 0.03 * i, 0.02 * i + 0.02);
      paper.rotation.z = (i - 1.5) * 0.015;
      dossierGroup.add(paper);
    }

    // Glass seal / overlay shield
    const glassOverlayGeom = new THREE.BoxGeometry(2.7, 3.7, 0.05);
    const glassOverlay = new THREE.Mesh(glassOverlayGeom, matGlass);
    glassOverlay.position.set(0, 0, 0.16);
    dossierGroup.add(glassOverlay);

    // Copper Header & Deadline Flag on dossier
    const tagGeom = new THREE.BoxGeometry(0.85, 0.28, 0.06);
    const tag = new THREE.Mesh(tagGeom, matCopper);
    tag.position.set(0.85, 1.6, 0.22);
    dossierGroup.add(tag);

    // Seal badge (circle)
    const sealGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
    sealGeom.rotateX(Math.PI / 2);
    const seal = new THREE.Mesh(sealGeom, matCopper);
    seal.position.set(-0.85, 1.35, 0.22);
    dossierGroup.add(seal);

    // 2. Workflow Stage Orbit Nodes
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const nodePositions = [
      { pos: new THREE.Vector3(-2.2, 1.4, 0.8), mat: matNodeSuccess, label: 'Submission' },
      { pos: new THREE.Vector3(-1.8, -1.2, 1.1), mat: matNodeActive, label: 'Scrutiny' },
      { pos: new THREE.Vector3(1.9, 1.5, 0.7), mat: matCopper, label: 'EVC Visit' },
      { pos: new THREE.Vector3(2.3, -0.8, 1.0), mat: matNodeWarning, label: 'SAC Hearing' },
      { pos: new THREE.Vector3(0.1, -2.1, 1.2), mat: matNodeSuccess, label: 'Authorized LoA' },
    ];

    const nodeMeshes: THREE.Group[] = [];
    nodePositions.forEach((n) => {
      const g = new THREE.Group();
      g.position.copy(n.pos);

      const ringGeom = new THREE.TorusGeometry(0.26, 0.03, 16, 32);
      const ring = new THREE.Mesh(ringGeom, matCopper);
      g.add(ring);

      const sphereGeom = new THREE.SphereGeometry(0.16, 24, 24);
      const sphere = new THREE.Mesh(sphereGeom, n.mat);
      g.add(sphere);

      nodeGroup.add(g);
      nodeMeshes.push(g);
    });

    // Connecting Dependency Pipeline Lines
    const linePoints = nodePositions.map(n => n.pos);
    const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
    const pipelineLine = new THREE.Line(lineGeom, matLine);
    mainGroup.add(pipelineLine);

    // Inspection calendar card
    const calGeom = new THREE.BoxGeometry(1.2, 1.4, 0.04);
    const calMesh = new THREE.Mesh(calGeom, matDossierFront);
    calMesh.position.set(1.8, 0.2, 0.5);
    calMesh.rotation.set(0.15, -0.3, 0.1);
    mainGroup.add(calMesh);

    // Copper pin on calendar
    const pinGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16);
    const pin = new THREE.Mesh(pinGeom, matCopper);
    pin.position.set(1.8, 0.78, 0.56);
    pin.rotation.x = Math.PI / 2;
    mainGroup.add(pin);

    // Interaction variables
    let targetRotationX = 0.08;
    let targetRotationY = -0.22;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const relY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      mouseX = relX * 2;
      mouseY = relY * 2;
    };

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Floating ambient motion
      dossierGroup.position.y = Math.sin(t * 1.2) * 0.08;
      dossierGroup.rotation.z = Math.sin(t * 0.8) * 0.03;

      calMesh.position.y = 0.2 + Math.cos(t * 1.5) * 0.06;

      // Orbiting nodes pulse
      nodeMeshes.forEach((n, i) => {
        n.position.y += Math.sin(t * 2 + i * 1.2) * 0.0015;
        n.rotation.y = t * 0.5 + i;
      });

      // Mouse Parallax Lerp
      targetRotationY = -0.25 + mouseX * 0.35;
      targetRotationX = 0.08 - mouseY * 0.25;

      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
