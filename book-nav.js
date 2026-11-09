/**
 * book-nav.js
 * Unified book-to-book navigation and audio feedback for the Great Books Digital Portfolio.
 * Active across all book interfaces (Tomes I - V, excluding index.html).
 */

(function () {
  'use strict';

  // Ordered sequence of book interfaces (excluding bookshelf index.html)
  const bookPages = [
    'student-profile.html',
    'literary-analyses.html',
    'favorite-masterpiece.html',
    'summary-of-learning.html',
    'personal-reflection.html'
  ];

  // Preload paper slide audio
  const slideAudio = new Audio('assets/book slide.mp3');
  slideAudio.preload = 'auto';

  let isNavigating = false;

  function triggerNavigation(targetPage) {
    if (isNavigating || !targetPage) return;
    isNavigating = true;

    try {
      slideAudio.currentTime = 0;
      slideAudio.play().catch(function () {});
    } catch (err) {}

    setTimeout(function () {
      window.location.href = targetPage;
    }, 240);
  }

  // Bind click sound and delay to all inactive navigation menu links
  function initNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link:not(.is-active)');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        triggerNavigation(href);
      });
    });
  }

  // Handle Up and Down arrow keys to navigate between book interfaces
  function initArrowKeyNavigation() {
    document.addEventListener('keydown', function (e) {
      // Don't intercept if user is typing in an input, textarea, or contentEditable element
      if (
        e.target &&
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const activeLink = document.querySelector('.nav-menu-list .nav-link.is-active');
        const currentHref = activeLink ? activeLink.getAttribute('href') : '';
        let currentIndex = bookPages.indexOf(currentHref);

        // Fallback to resolving against current pathname
        if (currentIndex === -1) {
          const pathName = window.location.pathname.split('/').pop();
          currentIndex = bookPages.indexOf(pathName);
        }
        if (currentIndex === -1) return;

        let targetPage = null;
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          targetPage = bookPages[currentIndex - 1];
        } else if (e.key === 'ArrowDown' && currentIndex < bookPages.length - 1) {
          targetPage = bookPages[currentIndex + 1];
        }

        if (targetPage && !isNavigating) {
          e.preventDefault();
          triggerNavigation(targetPage);
        }
      }
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNavLinks();
      initArrowKeyNavigation();
    });
  } else {
    initNavLinks();
    initArrowKeyNavigation();
  }
})();

