import * as THREE from 'three';
import { GlobeScene } from './globe.js';
import { createEarth, createStarfield } from './earth.js';
import { MarkerSystem, latLongToVector3 } from './markers.js';
import { InteractionSystem } from './interactions.js';
import { UISystem } from './ui.js';

// Initialize core components
const globeScene = new GlobeScene('canvas-container');
const { earthGroup, earthMesh } = createEarth(50);
const starfield = createStarfield();

globeScene.add(earthGroup);
globeScene.add(starfield);

const markerSystem = new MarkerSystem(earthGroup, 50);
const uiSystem = new UISystem(null); // Will set interactionSystem later
const interactionSystem = new InteractionSystem(
  globeScene.camera, 
  globeScene.controls, 
  globeScene.scene, 
  markerSystem, 
  uiSystem
);
uiSystem.interactionSystem = interactionSystem;

let countryLabels = [];
const labelsContainer = document.getElementById('country-labels-container');

async function loadCountries() {
  try {
    let response = await fetch('./public/assets/countries.json');
    if (!response.ok) response = await fetch('./assets/countries.json');
    if (response.ok) {
      const data = await response.json();
      data.forEach(country => {
        // Create HTML element
        const el = document.createElement('div');
        el.className = 'country-label';
        el.textContent = country.name;
        labelsContainer.appendChild(el);

        // Get 3D position (slightly above surface to prevent clipping)
        const pos3D = latLongToVector3(country.lat, country.lng, 50.5);

        countryLabels.push({
          element: el,
          pos3D: pos3D,
          vector: new THREE.Vector3()
        });
      });
    }
  } catch (err) {
    console.error('Failed to load country labels', err);
  }
}

// Load Projects Data
async function init() {
  try {
    // Simulate loading time for progress ring demo if load is too fast
    let progress = 0;
    const progressEl = document.querySelector('.loading-progress');
    const loadInterval = setInterval(() => {
      progress += 10;
      if(progressEl) progressEl.textContent = `${Math.min(progress, 90)}%`;
      if(progress >= 90) clearInterval(loadInterval);
    }, 100);

    const response = await fetch('./public/assets/projects.json');
    if (!response.ok) {
        const response2 = await fetch('./assets/projects.json');
        if(response2.ok) {
            const data = await response2.json();
            data.projects.forEach(p => markerSystem.createMarker(p));
        }
    } else {
        const data = await response.json();
        data.projects.forEach(p => markerSystem.createMarker(p));
    }
    
    clearInterval(loadInterval);
    uiSystem.hideLoading();
    
    // Load country labels after projects
    await loadCountries();

  } catch (error) {
    console.error('Error loading projects:', error);
    uiSystem.hideLoading(); // Hide anyway to show globe
  }

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Animate markers (pulse)
    markerSystem.update(elapsedTime);
    
    // Slow starfield rotation
    starfield.rotation.y = elapsedTime * 0.02;
    
    // Fast foreground dust rotation (parallax effect)
    if (starfield.userData.dustMesh) {
      starfield.userData.dustMesh.rotation.y = elapsedTime * 0.08;
      starfield.userData.dustMesh.rotation.z = elapsedTime * 0.03;
    }

    // Cloud rotation (independent of earth)
    if (earthGroup.userData.cloudMesh) {
      earthGroup.userData.cloudMesh.rotation.y = elapsedTime * 0.05;
      earthGroup.userData.cloudMesh.rotation.x = elapsedTime * 0.01;
    }

    // Update Country & State Labels
    const cameraDist = globeScene.camera.position.length();
    const showLabels = cameraDist < 180; // Only show when zoomed in close

    countryLabels.forEach(label => {
      // Get the world position of the label on the rotating earth
      label.vector.copy(label.pos3D);
      label.vector.applyMatrix4(earthGroup.matrixWorld);

      // Check if it's on the front side of the earth relative to the camera
      // Earth is at (0,0,0) in world space
      const toCamera = globeScene.camera.position.clone().normalize();
      const normal = label.vector.clone().normalize();
      const dot = normal.dot(toCamera);

      if (dot > 0.2 && showLabels) { // 0.2 means it's sufficiently facing the camera
        // Project to 2D screen space
        label.vector.project(globeScene.camera);
        
        const x = (label.vector.x * .5 + .5) * window.innerWidth;
        const y = (label.vector.y * -.5 + .5) * window.innerHeight;
        
        label.element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        label.element.classList.add('visible');
      } else {
        label.element.classList.remove('visible');
      }
    });

    globeScene.render();
  }

  animate();
}

init();
