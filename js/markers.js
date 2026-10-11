import * as THREE from 'three';

// Convert Lat/Lng to 3D Cartesian coordinates
export function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

export class MarkerSystem {
  constructor(earthGroup, radius = 50) {
    this.earthGroup = earthGroup;
    this.radius = radius;
    this.markers = [];
    this.labelsContainer = document.getElementById('project-labels-container');
    if (!this.labelsContainer) {
      this.labelsContainer = document.createElement('div');
      this.labelsContainer.id = 'project-labels-container';
      document.getElementById('ui-layer').appendChild(this.labelsContainer);
    }
    this.onMarkerClickCallback = null;
  }

  setClickHandler(callback) {
    this.onMarkerClickCallback = callback;
  }

  createMarker(project) {
    const { lat, lng } = project.location;
    const pos = latLongToVector3(lat, lng, this.radius);

    const markerGroup = new THREE.Group();
    markerGroup.position.copy(pos);
    
    // Orient marker outward normal from Earth sphere
    markerGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );

    // 1. Sleek glowing beacon pillar
    const pillarHeight = 3.6;
    const pillarGeom = new THREE.CylinderGeometry(0.08, 0.18, pillarHeight, 16);
    pillarGeom.translate(0, pillarHeight / 2, 0);
    const pillarMat = new THREE.MeshPhongMaterial({ 
      color: 0x00f0ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
    markerGroup.add(pillarMesh);

    // 2. Glowing Orb Core on top
    const coreGeom = new THREE.SphereGeometry(0.55, 24, 24);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x00f2fe,
      emissiveIntensity: 1.5
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y = pillarHeight;
    markerGroup.add(coreMesh);

    // 3. Ground Ripple / Pulse Rings
    const ringGeom = new THREE.RingGeometry(0.6, 0.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    markerGroup.add(ringMesh);

    const pulseGeom = new THREE.RingGeometry(0.8, 2.2, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
    pulseMesh.rotation.x = Math.PI / 2;
    markerGroup.add(pulseMesh);

    // 4. LARGE INVISIBLE HIT TARGET FOR EFFORTLESS CLICKING
    const hitGeom = new THREE.SphereGeometry(4.5, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ 
      visible: false,
      transparent: true,
      opacity: 0.0
    });
    const hitMesh = new THREE.Mesh(hitGeom, hitMat);
    hitMesh.position.y = pillarHeight / 2;
    markerGroup.add(hitMesh);

    // 5. HTML Project Name Badge on the Pin
    const badgeEl = document.createElement('div');
    badgeEl.className = 'globe-pin-badge';
    badgeEl.innerHTML = `
      <span class="badge-pulse-indicator"></span>
      <span class="badge-title">${project.name}</span>
      <span class="badge-arrow">↗</span>
    `;
    badgeEl.dataset.projectId = project.id;
    badgeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onMarkerClickCallback) {
        this.onMarkerClickCallback(project);
      }
    });
    this.labelsContainer.appendChild(badgeEl);

    // Store references
    markerGroup.userData = { 
      project, 
      isMarker: true, 
      coreMesh, 
      pulseMesh, 
      hitMesh,
      badgeEl,
      worldPos: new THREE.Vector3(),
      tipPos3D: latLongToVector3(lat, lng, this.radius + pillarHeight + 1.2)
    };

    this.earthGroup.add(markerGroup);
    this.markers.push(markerGroup);

    return markerGroup;
  }

  update(time, camera, earthGroup) {
    const scale = 1.0 + Math.sin(time * 3) * 0.35;
    const opacity = 0.6 + Math.sin(time * 3) * 0.35;

    const toCamera = camera ? camera.position.clone().normalize() : null;

    this.markers.forEach(marker => {
      // Pulse animation
      const pulse = marker.userData.pulseMesh;
      if (pulse) {
        pulse.scale.set(scale, scale, scale);
        pulse.material.opacity = Math.max(0.1, opacity);
      }
      
      const core = marker.userData.coreMesh;
      if (core) {
        core.material.emissiveIntensity = 1.2 + Math.sin(time * 5) * 0.4;
      }

      // Update 2D Screen-space Project Name Badges
      if (camera && earthGroup && marker.userData.badgeEl) {
        const tipWorldPos = marker.userData.tipPos3D.clone();
        tipWorldPos.applyMatrix4(earthGroup.matrixWorld);

        const normal = tipWorldPos.clone().normalize();
        const dot = normal.dot(toCamera);

        // Show badge only when pin is facing the camera
        if (dot > 0.12) {
          tipWorldPos.project(camera);
          const x = (tipWorldPos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (tipWorldPos.y * -0.5 + 0.5) * window.innerHeight;

          marker.userData.badgeEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 12}px)`;
          marker.userData.badgeEl.classList.add('visible');
        } else {
          marker.userData.badgeEl.classList.remove('visible');
        }
      }
    });
  }
}
