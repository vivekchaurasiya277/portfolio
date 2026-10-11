import * as THREE from 'three';
import { GlobeScene } from './globe.js';
import { createEarth, createStarfield } from './earth.js';
import { MarkerSystem } from './markers.js';
import { InteractionSystem } from './interactions.js';
import { UISystem } from './ui.js';

// Initialize Core 3D Scene
const globeScene = new GlobeScene('canvas-container');
const { earthGroup, earthMesh } = createEarth(50);
const starfield = createStarfield();

globeScene.add(earthGroup);
globeScene.add(starfield);

const markerSystem = new MarkerSystem(earthGroup, 50);
const uiSystem = new UISystem(null);
const interactionSystem = new InteractionSystem(
  globeScene.camera, 
  globeScene.controls, 
  globeScene.scene, 
  markerSystem, 
  uiSystem
);
uiSystem.interactionSystem = interactionSystem;

// Load Projects Data & Initialize
async function init() {
  try {
    let progress = 0;
    const progressEl = document.querySelector('.loading-progress');
    const loadInterval = setInterval(() => {
      progress += 15;
      if (progressEl) progressEl.textContent = `${Math.min(progress, 90)}%`;
      if (progress >= 90) clearInterval(loadInterval);
    }, 80);

    let projects = [];
    try {
      const response = await fetch('./assets/projects.json');
      if (response.ok) {
        const data = await response.json();
        projects = data.projects;
      } else {
        const response2 = await fetch('./public/assets/projects.json');
        if (response2.ok) {
          const data = await response2.json();
          projects = data.projects;
        }
      }
    } catch (e) {
      console.warn('Fallback fetching projects:', e);
    }

    if (projects && projects.length > 0) {
      // Create pins on the globe
      projects.forEach(p => markerSystem.createMarker(p));
      // Populate Right Side Showcase Panel
      uiSystem.setProjects(projects);
    }

    clearInterval(loadInterval);
    uiSystem.hideLoading();

  } catch (error) {
    console.error('Error initializing portfolio:', error);
    uiSystem.hideLoading();
  }

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Animate Markers and their 2D Screen Badges
    markerSystem.update(elapsedTime, globeScene.camera, earthGroup);
    
    // Slow deep-space starfield rotation
    starfield.rotation.y = elapsedTime * 0.015;
    
    // Foreground Parallax Space Dust
    if (starfield.userData.dustMesh) {
      starfield.userData.dustMesh.rotation.y = elapsedTime * 0.05;
      starfield.userData.dustMesh.rotation.z = elapsedTime * 0.02;
    }

    // Realistic Cloud Atmosphere Rotation (Zoom Earth style)
    if (earthGroup.userData.cloudMesh) {
      earthGroup.userData.cloudMesh.rotation.y = elapsedTime * 0.012;
      earthGroup.userData.cloudMesh.rotation.x = Math.sin(elapsedTime * 0.005) * 0.006;
    }

    globeScene.render();
  }

  animate();
}

init();
