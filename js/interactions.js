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
    this.pointerDownPos = new THREE.Vector2();
    this.isDragging = false;
    
    // Connect marker HTML badge click callback
    this.markerSystem.setClickHandler((project) => {
      this.handleSelectProject(project);
    });

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('pointerdown', (e) => { 
      this.isDragging = false; 
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    
    this.controls.addEventListener('start', () => {
      document.body.style.cursor = 'grabbing';
    });

    this.controls.addEventListener('end', () => {
      document.body.style.cursor = 'default';
    });
  }

  onPointerMove(event) {
    // Check if moving exceeds click threshold
    const dist = Math.hypot(event.clientX - this.pointerDownPos.x, event.clientY - this.pointerDownPos.y);
    if (dist > 5) {
      this.isDragging = true;
    }

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Handle Hover Raycasting on large hit targets
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitTargets = this.markerSystem.markers.map(m => m.userData.hitMesh).filter(Boolean);
    const intersects = this.raycaster.intersectObjects(hitTargets);

    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
    } else if (!this.controls.state) {
      document.body.style.cursor = 'default';
    }
  }

  onPointerUp(event) {
    const dist = Math.hypot(event.clientX - this.pointerDownPos.x, event.clientY - this.pointerDownPos.y);
    if (dist > 6) {
      return; // Was a camera drag/rotation
    }

    // Raycast on click
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitTargets = this.markerSystem.markers.map(m => m.userData.hitMesh).filter(Boolean);
    const intersects = this.raycaster.intersectObjects(hitTargets);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const projectData = hitObj.userData.project;
      if (projectData) {
        this.handleSelectProject(projectData);
      }
    }
  }

  handleSelectProject(project) {
    if (!project) return;
    this.uiSystem.openModal(project);
    this.focusOnLocation(project.location.lat, project.location.lng, 90);
  }

  focusOnLocation(lat, lng, zoom = 90) {
    // Temporarily pause auto-rotation to let user inspect
    this.controls.autoRotate = false;

    const targetPos = latLongToVector3(lat, lng, zoom);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        this.controls.update();
      }
    });
  }
}
