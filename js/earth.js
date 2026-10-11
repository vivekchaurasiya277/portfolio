import * as THREE from 'three';

export function createEarth(radius = 50) {
  const earthGroup = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  const colorMapUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const bumpMapUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
  const waterMapUrl = 'https://unpkg.com/three-globe/example/img/earth-water.png';
  const cloudMapUrl = 'https://unpkg.com/three-globe/example/img/earth-clouds10k.png';

  // Base Earth Mesh with intense bump mapping for 3D effect
  const geometry = new THREE.SphereGeometry(radius, 128, 128); 
  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load(colorMapUrl),
    bumpMap: textureLoader.load(bumpMapUrl),
    bumpScale: 5.0, // Increased for intense 3D terrain
    specularMap: textureLoader.load(waterMapUrl),
    specular: new THREE.Color(0x555555), // More reflective water
    shininess: 35
  });

  const earthMesh = new THREE.Mesh(geometry, material);
  earthGroup.add(earthMesh);

  // Cloud Layer
  const cloudGeometry = new THREE.SphereGeometry(radius * 1.025, 128, 128); // Pushed further out
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load(cloudMapUrl),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthGroup.add(cloudMesh);
  earthGroup.userData.cloudMesh = cloudMesh;

  // Enhanced Atmosphere Glow (Tuned for Bloom)
  const atmosGeometry = new THREE.SphereGeometry(radius * 1.1, 128, 128);
  
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 3.5);
      gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.2; // Softer atmosphere
    }
  `;

  const atmosMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  });

  const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
  earthGroup.add(atmosMesh);

  return { earthGroup, earthMesh };
}

export function createStarfield() {
  const starsGroup = new THREE.Group();
  
  // Background Stars (far away, static)
  const bgStarsGeom = new THREE.BufferGeometry();
  const bgCount = 4000;
  const bgPositions = new Float32Array(bgCount * 3);
  const bgColors = new Float32Array(bgCount * 3);
  const color = new THREE.Color();

  for(let i = 0; i < bgCount; i++) {
    const r = 800 + Math.random() * 600;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    bgPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    bgPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    bgPositions[i*3+2] = r * Math.cos(phi);

    color.setHSL(0.6 + Math.random() * 0.1, 0.8, Math.random());
    bgColors[i*3] = color.r;
    bgColors[i*3+1] = color.g;
    bgColors[i*3+2] = color.b;
  }
  bgStarsGeom.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  bgStarsGeom.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
  const bgStarsMat = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  starsGroup.add(new THREE.Points(bgStarsGeom, bgStarsMat));

  // Foreground Parallax Space Dust (closer, moves faster relative to camera)
  const dustGeom = new THREE.BufferGeometry();
  const dustCount = 1500;
  const dustPositions = new Float32Array(dustCount * 3);
  
  for(let i = 0; i < dustCount; i++) {
    // Generate dust much closer to the earth
    const r = 150 + Math.random() * 200;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    dustPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    dustPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    dustPositions[i*3+2] = r * Math.cos(phi);
  }
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: 0.6,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  const dustMesh = new THREE.Points(dustGeom, dustMat);
  starsGroup.add(dustMesh);
  starsGroup.userData.dustMesh = dustMesh; // Expose for animation

  return starsGroup;
}
