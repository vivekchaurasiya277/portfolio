import * as THREE from 'three';

// Procedural texture generators to ensure 100% reliability with zero network lag
function createMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base gray gradient
  ctx.fillStyle = '#88888e';
  ctx.fillRect(0, 0, 512, 256);
  
  // Maria (dark lunar plains)
  ctx.fillStyle = '#55555c';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 15 + Math.random() * 45;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.filter = 'blur(8px)';
    ctx.fill();
  }
  ctx.filter = 'none';

  // Bright crater rays
  ctx.fillStyle = '#aaaaaf';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createMarsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Rust-red Mars base
  ctx.fillStyle = '#c1440e';
  ctx.fillRect(0, 0, 512, 256);

  // Dark canyon and basalt patches
  ctx.fillStyle = '#7a2805';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 512;
    const y = 50 + Math.random() * 156;
    const r = 20 + Math.random() * 50;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.filter = 'blur(10px)';
    ctx.fill();
  }
  ctx.filter = 'none';

  // Polar ice caps
  ctx.fillStyle = '#f0e6df';
  ctx.fillRect(0, 0, 512, 20); // North pole
  ctx.fillRect(0, 236, 512, 20); // South pole

  return new THREE.CanvasTexture(canvas);
}

function createJupiterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Striped atmospheric bands
  const bandColors = ['#d8caaf', '#b07f35', '#e3d2b4', '#8a5924', '#c9a063', '#eed9be', '#a56829'];
  const bandHeight = 256 / 14;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = bandColors[i % bandColors.length];
    ctx.fillRect(0, i * bandHeight, 512, bandHeight + 2);
  }

  // Great Red Spot
  ctx.fillStyle = '#c34a2c';
  ctx.beginPath();
  ctx.ellipse(320, 160, 36, 20, 0, 0, Math.PI * 2);
  ctx.filter = 'blur(4px)';
  ctx.fill();
  ctx.filter = 'none';

  return new THREE.CanvasTexture(canvas);
}

function createSaturnTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Golden ochre soft bands
  const colors = ['#e2bf7d', '#ceab68', '#dfc38a', '#c49e59', '#e8ce97'];
  const h = 256 / 10;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(0, i * h, 512, h + 2);
  }

  return new THREE.CanvasTexture(canvas);
}

function createSaturnRingsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0.0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.15, 'rgba(210, 185, 140, 0.85)');
  grad.addColorStop(0.45, 'rgba(175, 145, 100, 0.7)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.1)'); // Cassini division
  grad.addColorStop(0.65, 'rgba(220, 195, 150, 0.9)');
  grad.addColorStop(0.9, 'rgba(160, 130, 90, 0.4)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);

  return new THREE.CanvasTexture(canvas);
}

function createNeptuneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#274687');
  grad.addColorStop(0.5, '#4b70dd');
  grad.addColorStop(1.0, '#1c3466');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Storm bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * 256;
    ctx.fillRect(0, y, 512, 4 + Math.random() * 6);
  }

  return new THREE.CanvasTexture(canvas);
}

export class PlanetarySystem {
  constructor(scene) {
    this.scene = scene;
    this.planetsGroup = new THREE.Group();
    this.scene.add(this.planetsGroup);

    this.initPlanets();
  }

  initPlanets() {
    // 1. The Moon (Orbiting Earth)
    const moonGeom = new THREE.SphereGeometry(3.2, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: createMoonTexture(),
      roughness: 0.9,
      metalness: 0.1
    });
    this.moon = new THREE.Mesh(moonGeom, moonMat);
    this.moonOrbitRadius = 96;
    this.planetsGroup.add(this.moon);

    // 2. Mars (The Red Planet)
    const marsGeom = new THREE.SphereGeometry(6.2, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      map: createMarsTexture(),
      roughness: 0.85
    });
    this.mars = new THREE.Mesh(marsGeom, marsMat);
    this.mars.position.set(-260, 45, -160);
    this.planetsGroup.add(this.mars);

    // Mars subtle red atmosphere glow
    const marsGlowGeom = new THREE.SphereGeometry(6.8, 32, 32);
    const marsGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff4411,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    this.mars.add(new THREE.Mesh(marsGlowGeom, marsGlowMat));

    // 3. Jupiter (The King of Planets)
    const jupiterGeom = new THREE.SphereGeometry(18, 48, 48);
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: createJupiterTexture(),
      roughness: 0.8
    });
    this.jupiter = new THREE.Mesh(jupiterGeom, jupiterMat);
    this.jupiter.position.set(380, -90, -320);
    this.planetsGroup.add(this.jupiter);

    // 4. Saturn with Majestic Rings
    const saturnGeom = new THREE.SphereGeometry(13.5, 48, 48);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: createSaturnTexture(),
      roughness: 0.8
    });
    this.saturn = new THREE.Mesh(saturnGeom, saturnMat);
    this.saturn.position.set(-420, 110, 240);
    this.saturn.rotation.z = THREE.MathUtils.degToRad(26.7); // Authentic Saturn tilt

    // Saturn 3D Rings
    const ringGeom = new THREE.RingGeometry(17, 32, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: createSaturnRingsTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });
    const saturnRings = new THREE.Mesh(ringGeom, ringMat);
    saturnRings.rotation.x = Math.PI / 2;
    this.saturn.add(saturnRings);
    this.planetsGroup.add(this.saturn);

    // 5. Neptune (The Deep Azure Ice Giant)
    const neptuneGeom = new THREE.SphereGeometry(10, 32, 32);
    const neptuneMat = new THREE.MeshStandardMaterial({
      map: createNeptuneTexture(),
      roughness: 0.7
    });
    this.neptune = new THREE.Mesh(neptuneGeom, neptuneMat);
    this.neptune.position.set(160, 170, -450);
    
    // Azure glow
    const neptuneGlowGeom = new THREE.SphereGeometry(11.2, 32, 32);
    const neptuneGlowMat = new THREE.MeshBasicMaterial({
      color: 0x3388ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    this.neptune.add(new THREE.Mesh(neptuneGlowGeom, neptuneGlowMat));
    this.planetsGroup.add(this.neptune);
  }

  update(time) {
    // Moon orbit around Earth
    const moonSpeed = time * 0.12;
    this.moon.position.x = Math.cos(moonSpeed) * this.moonOrbitRadius;
    this.moon.position.z = Math.sin(moonSpeed) * this.moonOrbitRadius;
    this.moon.position.y = Math.sin(moonSpeed * 0.5) * 16;
    this.moon.rotation.y = time * 0.08;

    // Mars rotation
    if (this.mars) {
      this.mars.rotation.y = time * 0.04;
    }

    // Jupiter rotation
    if (this.jupiter) {
      this.jupiter.rotation.y = time * 0.03;
    }

    // Saturn rotation
    if (this.saturn) {
      this.saturn.rotation.y = time * 0.025;
    }

    // Neptune rotation
    if (this.neptune) {
      this.neptune.rotation.y = time * 0.02;
    }
  }
}
