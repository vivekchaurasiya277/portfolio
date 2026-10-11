export class UISystem {
  constructor(interactionSystem) {
    this.interactionSystem = interactionSystem;
    
    // DOM Elements
    this.modal = document.getElementById('project-modal');
    this.modalContent = this.modal.querySelector('.modal-content');
    this.closeBtn = document.getElementById('close-modal');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.loadingScreen = document.getElementById('loading-screen');
    this.audioToggle = document.getElementById('audio-toggle');
    
    this.audioEnabled = false;

    this.initEvents();
  }

  initEvents() {
    // Close Modal
    this.closeBtn.addEventListener('click', () => {
      this.closeModal();
      // Resume rotation
      if (this.interactionSystem && this.interactionSystem.controls) {
        this.interactionSystem.controls.autoRotate = true;
      }
    });

    // Filter Buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active state
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const region = e.target.dataset.region;
        this.handleFilterClick(region);
      });
    });

    // Audio Toggle
    this.audioToggle.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;
      this.audioToggle.textContent = this.audioEnabled ? '🔊' : '🔇';
      // In a full implementation, you'd play/pause a background track here
    });
  }

  hideLoading() {
    const progress = document.querySelector('.loading-progress');
    progress.textContent = '100%';
    setTimeout(() => {
      this.loadingScreen.classList.add('hidden');
    }, 500);
  }

  openModal(project) {
    // Generate Tech Tags
    const techTags = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    
    // Inject Content
    this.modalContent.innerHTML = `
      <h2>${project.name}</h2>
      <div class="location">📍 ${project.location.name}</div>
      ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image" onerror="this.style.display='none'"/>` : ''}
      <p>${project.description}</p>
      <div class="tech-stack">${techTags}</div>
      <a href="${project.link}" target="_blank" class="project-link">View Project &rarr;</a>
    `;

    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  handleFilterClick(region) {
    if (!this.interactionSystem) return;

    // predefined rough coordinates for regions to focus camera
    const regionCoords = {
      'North America': { lat: 40, lng: -100, zoom: 180 },
      'South America': { lat: -15, lng: -60, zoom: 180 },
      'Europe': { lat: 50, lng: 10, zoom: 150 },
      'Africa': { lat: 0, lng: 20, zoom: 180 },
      'Asia': { lat: 30, lng: 100, zoom: 180 },
      'Australia': { lat: -25, lng: 135, zoom: 150 },
      'Arctic': { lat: 80, lng: 0, zoom: 150 },
      'India': { lat: 20.5937, lng: 78.9629, zoom: 130 },
      'All': { lat: 20, lng: 0, zoom: 300 }
    };

    const coords = regionCoords[region] || regionCoords['All'];
    this.interactionSystem.focusOnLocation(coords.lat, coords.lng, coords.zoom);
    
    // Resume auto rotation if "All" is selected
    if (region === 'All') {
      setTimeout(() => {
        this.interactionSystem.controls.autoRotate = true;
      }, 1500);
    }
  }
}
