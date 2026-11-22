(() => {
  const root = document.documentElement;
  // The book canvas includes room for the full spread, menu, and bookmarks.
  const baseWidth = document.querySelector('.bulletin-board') ? 1200 : 1360;
  const baseHeight = 820;

  root.style.setProperty('--design-width', `${baseWidth}px`);
  root.style.setProperty('--design-height', `${baseHeight}px`);

  function fitViewport() {
    // Desktop zoom changes the layout viewport. Keep pinch zoom available
    // for magnifying content without refitting to its visual viewport.
    const scale = Math.min(1, window.innerWidth / baseWidth, window.innerHeight / baseHeight);
    root.style.setProperty('--view-scale', String(scale));
    root.classList.toggle('is-scaled', scale < 1);
  }

  fitViewport();
  window.addEventListener('resize', fitViewport);
  window.visualViewport?.addEventListener('resize', fitViewport);
})();
