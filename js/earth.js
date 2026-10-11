import * as THREE from 'three';

export function createEarth(radius = 50) {
  const earthGroup = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  const colorMapUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const bumpMapUrl = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
  const waterMapUrl = 'https://unpkg.com/three-globe/example/img/earth-water.png';
  
  // Local 4K satellite cloud texture with remote fallback
  const cloudMapUrl = './assets/earth-clouds.png';

  // Base Earth Mesh with intense bump mapping for 3D realism
  const geometry = new THREE.SphereGeometry(radius, 128, 128); 
  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load(colorMapUrl),
    bumpMap: textureLoader.load(bumpMapUrl),
    bumpScale: 4.5,
    specularMap: textureLoader.load(waterMapUrl),
    specular: new THREE.Color(0x334455),
    shininess: 25
  });

  const earthMesh = new THREE.Mesh(geometry, material);
  earthGroup.add(earthMesh);

  // Realistic Satellite Cloud Layer (inspired by Zoom Earth)
  const cloudGeometry = new THREE.SphereGeometry(radius * 1.018, 128, 128);
  const cloudTexture = textureLoader.load(cloudMapUrl, undefined, undefined, () => {
    // Fallback to high-res cloud texture if local file has issue
    cloudTexture.image = textureLoader.load('https://cdn.jsdelivr.net/gh/turban/webgl-earth/images/fair_clouds_4k.png');
  });

  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.82,
    roughness: 0.9,
    metalness: 0.05,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthGroup.add(cloudMesh);
  earthGroup.userData.cloudMesh = cloudMesh;

  // Outer Atmospheric Glow
  const atmosGeometry = new THREE.SphereGeometry(radius * 1.12, 128, 128);
  
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
      float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 3.2);
      gl_FragColor = vec4(0.25, 0.65, 1.0, 1.0) * intensity * 1.4;
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
  
  // Background Stars (deep space)
  const bgStarsGeom = new THREE.BufferGeometry();
  const bgCount = 4500;
  const bgPositions = new Float32Array(bgCount * 3);
  const bgColors = new Float32Array(bgCount * 3);
  const color = new THREE.Color();

  for (let i = 0; i < bgCount; i++) {
    const r = 900 + Math.random() * 800;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    bgPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    bgPositions[i * 3 + 2] = r * Math.cos(phi);

    color.setHSL(0.55 + Math.random() * 0.15, 0.7, 0.5 + Math.random() * 0.5);
    bgColors[i * 3] = color.r;
    bgColors[i * 3 + 1] = color.g;
    bgColors[i * 3 + 2] = color.b;
  }
  bgStarsGeom.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  bgStarsGeom.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
  
  const bgStarsMat = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });
  starsGroup.add(new THREE.Points(bgStarsGeom, bgStarsMat));

  // Foreground Parallax Space Dust
  const dustGeom = new THREE.BufferGeometry();
  const dustCount = 1200;
  const dustPositions = new Float32Array(dustCount * 3);
  
  for (let i = 0; i < dustCount; i++) {
    const r = 160 + Math.random() * 220;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    dustPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x66ccff,
    size: 0.8,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  const dustMesh = new THREE.Points(dustGeom, dustMat);
  starsGroup.add(dustMesh);
  starsGroup.userData.dustMesh = dustMesh;

  return starsGroup;
}
