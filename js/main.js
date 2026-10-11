import './walk.js';

// Interactive UI Enhancements for Vivek's Portfolio
document.addEventListener('DOMContentLoaded', () => {
  // Plain View vs Cinematic View Toggle
  const viewToggleBtn = document.getElementById('view-toggle-btn');
  const viewToggleText = viewToggleBtn ? viewToggleBtn.querySelector('.t') : null;

  const setViewMode = (mode) => {
    if (mode === 'plain') {
      document.body.classList.add('plain-view');
      if (viewToggleText) viewToggleText.textContent = 'Cinematic view';
      try { localStorage.setItem('vivek_portfolio_view', 'plain'); } catch(e){}
    } else {
      document.body.classList.remove('plain-view');
      if (viewToggleText) viewToggleText.textContent = 'Plain view';
      try { localStorage.setItem('vivek_portfolio_view', 'cinematic'); } catch(e){}
      window.dispatchEvent(new Event('resize'));
    }
  };

  try {
    const savedView = localStorage.getItem('vivek_portfolio_view');
    if (savedView === 'plain') {
      setViewMode('plain');
    }
  } catch(e){}

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPlain = document.body.classList.contains('plain-view');
      setViewMode(isPlain ? 'cinematic' : 'plain');
    });
  }

  // Resume Modal Triggers
  const resumeBtn = document.getElementById('open-resume-btn');
  const navResumeBtn = document.getElementById('nav-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const closeResumeBtn = document.getElementById('close-resume-modal');

  const openResume = (e) => {
    if (e) e.preventDefault();
    if (resumeModal) resumeModal.classList.remove('hidden');
  };

  const closeResume = () => {
    if (resumeModal) resumeModal.classList.add('hidden');
  };

  if (resumeBtn) resumeBtn.addEventListener('click', openResume);
  if (navResumeBtn) navResumeBtn.addEventListener('click', openResume);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResume();
    });
  }

  // Copy Email Button
  const copyBtn = document.getElementById('copy-email-fast-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText('vivekchaurasiya.work@gmail.com').then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied! ✓';
        setTimeout(() => {
          copyBtn.textContent = orig;
        }, 2000);
      });
    });
  }

  // Keyboard Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeResume();
  });
});
