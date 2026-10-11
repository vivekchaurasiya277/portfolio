import * as THREE from 'three';
import gsap from 'gsap';
import { latLongToVector3 } from './markers.js';

export class InteractionSystem {
  constructor(camera, controls, scene, markerSystem, uiSystem) {
    this.camera = camera;
    this.controls = controls;
    this.scene = scene;
    this.markerSystem = markerSystem;
    this.uiSystem = uiSystem;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Track if user is currently interacting
    this.isDragging = false;
    
    this.initEvents();
  }

  initEvents() {
    window.addEventListener('pointerdown', () => { this.isDragging = false; });
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    
    // When controls start/stop
    this.controls.addEventListener('start', () => {
      document.body.style.cursor = 'grabbing';
    });
    this.controls.addEventListener('end', () => {
      document.body.style.cursor = 'default';
    });
  }

  onPointerMove(event) {
    this.isDragging = true;
    
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Handle Hover Raycasting
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.markerSystem.markers.map(m => m.userData.coreMesh)
    );

    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      // Could trigger hover label here
    } else if (!this.controls.state) { // Don't reset if dragging
      document.body.style.cursor = 'default';
    }
  }

  onPointerUp(event) {
    if (this.isDragging) {
      // Small threshold to distinguish click vs drag
      const deltaX = (event.clientX / window.innerWidth) * 2 - 1 - this.mouse.x;
      const deltaY = -(event.clientY / window.innerHeight) * 2 + 1 - this.mouse.y;
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        return; // It was a drag
      }
    }

    // Handle Click Raycasting
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.markerSystem.markers.map(m => m.userData.coreMesh)
    );

    if (intersects.length > 0) {
      // Find parent group
      let object = intersects[0].object;
      while (object.parent && !object.userData.isMarker) {
        object = object.parent;
      }
      
      const projectData = object.userData.project;
      this.uiSystem.openModal(projectData);
      this.focusOnLocation(projectData.location.lat, projectData.location.lng);
    }
  }

  focusOnLocation(lat, lng, zoom = 80) {
    // Disable auto-rotate temporarily
    const wasAutoRotate = this.controls.autoRotate;
    this.controls.autoRotate = false;

    const targetPos = latLongToVector3(lat, lng, zoom);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Optional: re-enable autoRotate after a delay if modal is closed
      }
    });
  }
}
