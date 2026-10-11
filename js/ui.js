export class UISystem {
  constructor(interactionSystem) {
    this.interactionSystem = interactionSystem;
    this.projects = [];
    
    // DOM Elements
    this.modal = document.getElementById('project-modal');
    this.modalContent = this.modal.querySelector('.modal-content');
    this.closeBtn = document.getElementById('close-modal');
    
    this.resumeModal = document.getElementById('resume-modal');
    this.resumeBtn = document.getElementById('resume-btn');
    this.closeResumeBtn = document.getElementById('close-resume-modal');
    
    this.panelToggleBtn = document.getElementById('panel-toggle-btn');
    this.projectsPanel = document.getElementById('projects-panel');
    this.projectsListContainer = document.getElementById('projects-list');

    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.loadingScreen = document.getElementById('loading-screen');
    this.audioToggle = document.getElementById('audio-toggle');
    this.audioEnabled = false;

    this.initEvents();
  }

  setProjects(projects) {
    this.projects = projects;
    this.renderProjectsPanel();
  }

  initEvents() {
    // Close Project Modal
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Resume Modal
    if (this.resumeBtn) {
      this.resumeBtn.addEventListener('click', () => {
        this.openResumeModal();
      });
    }

    if (this.closeResumeBtn) {
      this.closeResumeBtn.addEventListener('click', () => {
        this.closeResumeModal();
      });
    }

    // Projects Panel Toggle (for mobile or minimizing)
    if (this.panelToggleBtn) {
      this.panelToggleBtn.addEventListener('click', () => {
        this.projectsPanel.classList.toggle('collapsed');
      });
    }

    // Close on outside overlay click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeResumeModal();
      }
    });

    // Filter Buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const region = e.target.dataset.region;
        this.handleFilterClick(region);
      });
    });

    // Audio Toggle
    if (this.audioToggle) {
      this.audioToggle.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        this.audioToggle.textContent = this.audioEnabled ? '🔊' : '🔇';
      });
    }
  }

  renderProjectsPanel() {
    if (!this.projectsListContainer) return;
    this.projectsListContainer.innerHTML = '';

    this.projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'panel-card';
      card.dataset.projectId = project.id;
      
      const techTags = (project.tech || []).slice(0, 3).map(t => `<span class="panel-tag">${t}</span>`).join('');

      card.innerHTML = `
        <div class="panel-card-header">
          <div class="panel-card-title-wrap">
            <span class="card-pulse-dot"></span>
            <h4>${project.name}</h4>
          </div>
          <span class="card-year">${project.year || ''}</span>
        </div>
        <p class="panel-card-subtitle">${project.subtitle || project.category || ''}</p>
        <div class="panel-card-tech">${techTags}</div>
        <div class="panel-card-action">
          <span>Fly on Globe &rarr;</span>
        </div>
      `;

      card.addEventListener('click', () => {
        // Highlight active card
        document.querySelectorAll('.panel-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (this.interactionSystem) {
          this.interactionSystem.handleSelectProject(project);
        }
      });

      this.projectsListContainer.appendChild(card);
    });
  }

  hideLoading() {
    const progress = document.querySelector('.loading-progress');
    if (progress) progress.textContent = '100%';
    setTimeout(() => {
      if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
    }, 400);
  }

  openModal(project) {
    if (!project) return;
    
    // Highlight matching panel card
    document.querySelectorAll('.panel-card').forEach(c => {
      c.classList.toggle('active', c.dataset.projectId === project.id);
    });

    const techTags = (project.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
    const highlightsHtml = (project.highlights || []).map(h => `<li><span class="highlight-bullet">✦</span> ${h}</li>`).join('');

    this.modalContent.innerHTML = `
      <div class="modal-badge-row">
        <span class="modal-category">${project.category || 'Featured Work'}</span>
        <span class="modal-year">${project.year || ''}</span>
      </div>
      <h2>${project.name}</h2>
      ${project.subtitle ? `<div class="modal-subtitle">${project.subtitle}</div>` : ''}
      <div class="modal-glass-divider"></div>
      
      <p class="modal-description">${project.description}</p>
      
      ${highlightsHtml ? `
        <div class="modal-highlights">
          <h5>Key Architecture & Results:</h5>
          <ul>${highlightsHtml}</ul>
        </div>
      ` : ''}

      <div class="tech-stack-section">
        <h5>Technologies:</h5>
        <div class="tech-stack">${techTags}</div>
      </div>
      
      <div class="modal-actions">
        ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-btn-primary">View GitHub Repository &rarr;</a>` : ''}
        <button class="project-btn-secondary" id="modal-resume-trigger">View Resume</button>
      </div>
    `;

    const resumeBtnInModal = this.modalContent.querySelector('#modal-resume-trigger');
    if (resumeBtnInModal) {
      resumeBtnInModal.addEventListener('click', () => {
        this.openResumeModal();
      });
    }

    this.modal.classList.remove('hidden');
  }

  closeModal() {
    if (this.modal) this.modal.classList.add('hidden');
    document.querySelectorAll('.panel-card').forEach(c => c.classList.remove('active'));
    if (this.interactionSystem && this.interactionSystem.controls) {
      this.interactionSystem.controls.autoRotate = true;
    }
  }

  openResumeModal() {
    if (this.resumeModal) this.resumeModal.classList.remove('hidden');
  }

  closeResumeModal() {
    if (this.resumeModal) this.resumeModal.classList.add('hidden');
  }

  handleFilterClick(region) {
    if (!this.interactionSystem) return;

    const regionCoords = {
      'India': { lat: 22.5, lng: 80.0, zoom: 120 },
      'All': { lat: 20, lng: 30, zoom: 250 }
    };

    const coords = regionCoords[region] || regionCoords['All'];
    this.interactionSystem.focusOnLocation(coords.lat, coords.lng, coords.zoom);

    if (region === 'All') {
      setTimeout(() => {
        if (this.interactionSystem.controls) {
          this.interactionSystem.controls.autoRotate = true;
        }
      }, 1500);
    }
  }
}
