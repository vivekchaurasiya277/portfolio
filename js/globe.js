import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class GlobeScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    
    // Setup Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2500
    );
    this.camera.position.set(0, 30, 250);

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Setup Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 60; // Close zoom into pins
    this.controls.maxDistance = 550;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;

    // Setup Lighting & Celestial Sun
    this.setupLightingAndSun();
    
    // Setup Post-Processing (Bloom for glowing Sun, atmosphere, and pins)
    const renderScene = new RenderPass(this.scene, this.camera);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.65, // Bloom Strength
      0.5,  // Bloom Radius
      0.82  // Bloom Threshold
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLightingAndSun() {
    // Ambient Light - keep subtle so day/night terminator on Earth is prominent
    const ambientLight = new THREE.AmbientLight(0x223344, 0.45);
    this.scene.add(ambientLight);

    // Sun Position in Space
    const sunDistance = 320;
    const sunPos = new THREE.Vector3(sunDistance * 0.8, sunDistance * 0.35, sunDistance * 0.65);

    // Directional Sunlight aimed at the Earth center (0, 0, 0)
    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.2);
    sunLight.position.copy(sunPos);
    sunLight.target.position.set(0, 0, 0);
    this.scene.add(sunLight);
    this.scene.add(sunLight.target);

    // Additional radial point light radiating from the Sun
    const sunPointLight = new THREE.PointLight(0xffeedd, 1.8, 1200, 0.8);
    sunPointLight.position.copy(sunPos);
    this.scene.add(sunPointLight);

    // Visible 3D Sun Mesh Group
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.copy(sunPos);

    // 1. Sun Core Sphere (blazing white-gold)
    const sunGeom = new THREE.SphereGeometry(15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff8e0
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunGroup.add(sunMesh);

    // 2. Inner Corona Glow Sphere
    const innerCoronaGeom = new THREE.SphereGeometry(18, 32, 32);
    const innerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xffd066,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const innerCorona = new THREE.Mesh(innerCoronaGeom, innerCoronaMat);
    this.sunGroup.add(innerCorona);

    // 3. Procedural Sun Flare / Outer Atmospheric Halo Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.15, 'rgba(255, 240, 180, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 180, 50, 0.5)');
    gradient.addColorStop(0.7, 'rgba(255, 100, 20, 0.15)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const flareTexture = new THREE.CanvasTexture(canvas);
    const flareMaterial = new THREE.SpriteMaterial({
      map: flareTexture,
      blending: THREE.AdditiveBlending,
      color: 0xffeedd,
      transparent: true,
      opacity: 0.95
    });

    const flareSprite = new THREE.Sprite(flareMaterial);
    flareSprite.scale.set(130, 130, 1);
    this.sunGroup.add(flareSprite);

    this.scene.add(this.sunGroup);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  add(object) {
    this.scene.add(object);
  }

  render() {
    this.controls.update();
    this.composer.render();
  }
}
