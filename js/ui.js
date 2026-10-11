export class UISystem {
  constructor(interactionSystem) {
    this.interactionSystem = interactionSystem;
    this.projects = [];
    
    // DOM Elements
    this.projectModal = document.getElementById('project-modal');
    this.modalContent = this.projectModal ? this.projectModal.querySelector('.modal-content') : null;
    this.closeProjectBtn = document.getElementById('close-modal');
    
    this.resumeModal = document.getElementById('resume-modal');
    this.resumeBtn = document.getElementById('resume-btn');
    this.closeResumeBtn = document.getElementById('close-resume-modal');
    
    this.contactModal = document.getElementById('contact-modal');
    this.contactBtn = document.getElementById('contact-btn');
    this.closeContactBtn = document.getElementById('close-contact-modal');
    this.copyEmailBtn = document.getElementById('copy-email-btn');

    this.panelToggleBtn = document.getElementById('panel-toggle-btn');
    this.projectsPanel = document.getElementById('projects-panel');
    this.projectsListContainer = document.getElementById('projects-list');

    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.loadingScreen = document.getElementById('loading-screen');

    this.initEvents();
  }

  setProjects(projects) {
    this.projects = projects;
    this.renderProjectsPanel();
  }

  initEvents() {
    // Project Modal Close
    if (this.closeProjectBtn) {
      this.closeProjectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Resume Modal Open & Close
    if (this.resumeBtn) {
      this.resumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openResumeModal();
      });
    }

    if (this.closeResumeBtn) {
      this.closeResumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeResumeModal();
      });
    }

    if (this.resumeModal) {
      this.resumeModal.addEventListener('click', (e) => {
        if (e.target === this.resumeModal) {
          this.closeResumeModal();
        }
      });
    }

    // Contact Modal Open & Close
    if (this.contactBtn) {
      this.contactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openContactModal();
      });
    }

    if (this.closeContactBtn) {
      this.closeContactBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeContactModal();
      });
    }

    if (this.contactModal) {
      this.contactModal.addEventListener('click', (e) => {
        if (e.target === this.contactModal) {
          this.closeContactModal();
        }
      });
    }

    // Copy Email Button
    if (this.copyEmailBtn) {
      this.copyEmailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText('vivekchaurasiya.work@gmail.com').then(() => {
          this.copyEmailBtn.textContent = 'Copied! ✓';
          setTimeout(() => {
            this.copyEmailBtn.textContent = 'Copy';
          }, 2000);
        });
      });
    }

    // Projects Panel Toggle (collapse/expand)
    if (this.panelToggleBtn) {
      this.panelToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.projectsPanel.classList.toggle('collapsed');
      });
    }

    // Escape Key to Close Any Open Modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeResumeModal();
        this.closeContactModal();
      }
    });

    // Continental Filter Buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const region = e.target.dataset.region;
        this.handleFilterClick(region);
      });
    });
  }

  renderProjectsPanel() {
    if (!this.projectsListContainer) return;
    this.projectsListContainer.innerHTML = '';

    let currentSection = null;

    this.projects.forEach(project => {
      const sectionKey = project.type || 'project';
      if (sectionKey !== currentSection) {
        currentSection = sectionKey;
        const divider = document.createElement('div');
        divider.className = `panel-section-divider section-${sectionKey}`;
        
        let label = '💻 FEATURED PROJECTS';
        if (sectionKey === 'startup') label = '🚀 STARTUP';
        else if (sectionKey === 'internship') label = '🛰️ INTERNSHIP';

        divider.innerHTML = `<span class="section-badge">${label}</span>`;
        this.projectsListContainer.appendChild(divider);
      }

      const card = document.createElement('div');
      card.className = `panel-card panel-card-${project.type || 'project'}`;
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
        <div class="panel-card-footer">
          <span class="panel-card-action">Fly on Globe &rarr;</span>
          ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="panel-github-icon" title="Open GitHub" onclick="event.stopPropagation(); window.open('${project.link}', '_blank'); return false;">GitHub ↗</a>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
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
    }, 300);
  }

  openModal(project) {
    if (!project || !this.modalContent) return;
    
    // Highlight matching panel card
    document.querySelectorAll('.panel-card').forEach(c => {
      c.classList.toggle('active', c.dataset.projectId === project.id);
    });

    const techTags = (project.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
    const highlightsHtml = (project.highlights || []).map(h => `<li><span class="highlight-bullet">✦</span> ${h}</li>`).join('');

    this.modalContent.innerHTML = `
      <div class="modal-badge-row">
        <span class="modal-category">${project.typeLabel || project.category || 'Featured'}</span>
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
        ${project.link ? `
          <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-btn-primary" onclick="window.open('${project.link}', '_blank'); return false;">
            View GitHub Repository &rarr;
          </a>` : ''}
        <button class="project-btn-secondary" id="modal-resume-trigger">View Resume</button>
      </div>
    `;

    const resumeBtnInModal = this.modalContent.querySelector('#modal-resume-trigger');
    if (resumeBtnInModal) {
      resumeBtnInModal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openResumeModal();
      });
    }

    if (this.projectModal) this.projectModal.classList.remove('hidden');
  }

  closeModal() {
    if (this.projectModal) this.projectModal.classList.add('hidden');
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

  openContactModal() {
    if (this.contactModal) this.contactModal.classList.remove('hidden');
  }

  closeContactModal() {
    if (this.contactModal) this.contactModal.classList.add('hidden');
  }

  handleFilterClick(region) {
    if (!this.interactionSystem) return;

    const regionCoords = {
      'Asia': { lat: 28.0, lng: 95.0, zoom: 140 },
      'North America': { lat: 38.0, lng: -98.0, zoom: 150 },
      'Europe': { lat: 48.0, lng: 12.0, zoom: 140 },
      'Australia': { lat: -25.0, lng: 135.0, zoom: 150 },
      'Africa': { lat: 2.0, lng: 25.0, zoom: 150 },
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
