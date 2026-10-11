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
    
    // Orient marker outward from Earth sphere
    markerGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );

    // 1. Sleek neon beacon pillar
    const pillarHeight = 3.2;
    const pillarGeom = new THREE.CylinderGeometry(0.06, 0.12, pillarHeight, 16);
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
    const coreGeom = new THREE.SphereGeometry(0.5, 20, 20);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x00f2fe,
      emissiveIntensity: 1.6
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y = pillarHeight;
    markerGroup.add(coreMesh);

    // 3. Crisp Ground Anchor Ring
    const ringGeom = new THREE.RingGeometry(0.4, 0.55, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    markerGroup.add(ringMesh);

    // 4. Subtle Thin Radar Pulse Ring (refined, never obscures the terrain)
    const pulseGeom = new THREE.RingGeometry(0.65, 0.82, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
    pulseMesh.rotation.x = Math.PI / 2;
    markerGroup.add(pulseMesh);

    // 5. LARGE INVISIBLE HIT TARGET FOR EFFORTLESS CLICKING
    const hitGeom = new THREE.SphereGeometry(4.0, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ 
      visible: false,
      transparent: true,
      opacity: 0.0
    });
    const hitMesh = new THREE.Mesh(hitGeom, hitMat);
    hitMesh.position.y = pillarHeight / 2;
    markerGroup.add(hitMesh);

    // 6. Floating HTML Project Name Badge on the Pin
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
      tipPos3D: latLongToVector3(lat, lng, this.radius + pillarHeight + 1.2)
    };

    this.earthGroup.add(markerGroup);
    this.markers.push(markerGroup);

    return markerGroup;
  }

  update(time, camera, earthGroup) {
    // Smooth radar expansion (1.0 -> 2.2) and fade
    const phase = (time * 1.5) % 1.0;
    const pulseScale = 1.0 + phase * 1.4;
    const pulseOpacity = (1.0 - phase) * 0.45;

    const toCamera = camera ? camera.position.clone().normalize() : null;

    this.markers.forEach(marker => {
      // Subtle pulse animation
      const pulse = marker.userData.pulseMesh;
      if (pulse) {
        pulse.scale.set(pulseScale, pulseScale, pulseScale);
        pulse.material.opacity = pulseOpacity;
      }
      
      const core = marker.userData.coreMesh;
      if (core) {
        core.material.emissiveIntensity = 1.2 + Math.sin(time * 4) * 0.3;
      }

      // Update 2D Screen-space Project Name Badges
      if (camera && earthGroup && marker.userData.badgeEl) {
        const tipWorldPos = marker.userData.tipPos3D.clone();
        tipWorldPos.applyMatrix4(earthGroup.matrixWorld);

        const normal = tipWorldPos.clone().normalize();
        const dot = normal.dot(toCamera);

        // Show badge only when pin is facing the camera
        if (dot > 0.15) {
          tipWorldPos.project(camera);
          const x = (tipWorldPos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (tipWorldPos.y * -0.5 + 0.5) * window.innerHeight;

          marker.userData.badgeEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y - 10}px)`;
          marker.userData.badgeEl.classList.add('visible');
        } else {
          marker.userData.badgeEl.classList.remove('visible');
        }
      }
    });
  }
}
