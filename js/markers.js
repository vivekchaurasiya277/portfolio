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
  }

  createMarker(project) {
    const { lat, lng } = project.location;
    const pos = latLongToVector3(lat, lng, this.radius);

    // Marker Group
    const { markerGroup, pulseMesh, coreMesh } = this.createMarkerMesh();
    
    markerGroup.position.copy(pos);
    
    // Orient marker to face outward from center
    markerGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );

    // Attach data for interaction
    // We attach the interaction to the coreMesh because it's what the user will click
    markerGroup.userData = { project, isMarker: true, coreMesh, pulseMesh };

    this.earthGroup.add(markerGroup);
    this.markers.push(markerGroup);

    return markerGroup;
  }

  createMarkerMesh() {
    const markerGroup = new THREE.Group();

    // The central sleek line (Pillar)
    const pillarHeight = 3.0;
    const pillarGeom = new THREE.CylinderGeometry(0.05, 0.05, pillarHeight, 8);
    // Move geometry up so its base is at 0
    pillarGeom.translate(0, pillarHeight / 2, 0);
    
    // Use an emissive material so the Bloom pass makes it glow slightly
    const pillarMat = new THREE.MeshPhongMaterial({ 
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.8
    });
    const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
    markerGroup.add(pillarMesh);

    // Core point (Small glowing orb on top of the pillar)
    const coreGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.0 
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y = pillarHeight; // Sit on top of pillar
    markerGroup.add(coreMesh);

    // Subtle Base Ring
    const ringGeom = new THREE.RingGeometry(0.5, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00d4ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2; // Lay flat on surface
    markerGroup.add(ringMesh);

    // Pulsing outer ring
    const pulseGeom = new THREE.RingGeometry(0.6, 1.5, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ 
      color: 0x00d4ff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
    pulseMesh.rotation.x = Math.PI / 2;
    markerGroup.add(pulseMesh);

    return { markerGroup, pulseMesh, coreMesh };
  }

  update(time) {
    const scale = 1.0 + Math.sin(time * 2) * 0.2;
    const opacity = 0.5 + Math.sin(time * 3) * 0.3;
    
    this.markers.forEach(marker => {
      const pulse = marker.userData.pulseMesh;
      if (pulse) {
        pulse.scale.set(scale, scale, scale);
        pulse.material.opacity = opacity;
      }
      
      // Slightly pulse the emissive intensity of the core
      const core = marker.userData.coreMesh;
      if (core) {
        core.material.emissiveIntensity = 0.8 + Math.sin(time * 4) * 0.3;
      }
    });
  }
}
