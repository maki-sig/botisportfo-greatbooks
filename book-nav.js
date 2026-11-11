/**
 * book-nav.js
 * Unified book-to-book navigation, audio feedback, and reading tip toast
 * for the Great Books Digital Portfolio.
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

  // Paper slide audio is loaded on demand (first navigation / key press).
  const slideAudio = new Audio('assets/book slide.mp3');
  slideAudio.preload = 'none';

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
        // Don't intercept if an enlarged photo modal is currently open
        if (document.querySelector('.photo-modal-backdrop.is-active')) return;
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

  // Handle Escape key to return to the bookshelf landing page
  function initEscapeNavigation() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.repeat) return;

      // Don't intercept if user is typing in an input, textarea, or contentEditable element
      if (
        e.target &&
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable)
      ) {
        return;
      }

      // Let an open lightbox or dialog close first
      if (
        document.querySelector(
          '.photo-modal-backdrop.is-active, .credits-letter-overlay.is-active'
        )
      ) {
        return;
      }

      if (isNavigating) return;
      triggerNavigation('index.html');
    });
  }

  // Paper tip toast for first-time book readers
  const TOAST_STORAGE_KEY = 'great_books_toast_shown';
  const TOAST_DURATION_MS = 8500; // 8.5 seconds display time
  const TOAST_COLLAPSE_MS = 500; // Matches the CSS collapse transition

  function initPaperToast() {
    let isFirstVisit = false;
    try {
      if (!sessionStorage.getItem(TOAST_STORAGE_KEY)) {
        sessionStorage.setItem(TOAST_STORAGE_KEY, 'true');
        isFirstVisit = true;
      }
    } catch (e) {
      // In case session storage is restricted
      isFirstVisit = true;
    }

    const toast = document.createElement('aside');
    toast.className = 'paper-toast';
    toast.id = 'reading-guide-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-label', 'Keyboard Navigation Tip');

    toast.innerHTML =
      '<button type="button" class="paper-toast-close" aria-label="Minimise reading guide">&times;</button>' +
      '<div class="paper-toast-header">' +
        '<span class="paper-toast-pin" aria-hidden="true">&#10022;</span>' +
        '<span class="paper-toast-title">Reading Guide</span>' +
      '</div>' +
      '<p class="paper-toast-intro">Navigate the collection with your keyboard:</p>' +
      '<div class="paper-toast-shortcuts">' +
        '<div class="paper-toast-shortcut">' +
          '<div class="paper-key-group">' +
            '<kbd class="paper-key">&uarr;</kbd>' +
            '<kbd class="paper-key">&darr;</kbd>' +
          '</div>' +
          '<span class="paper-key-desc">Navigate tomes</span>' +
        '</div>' +
        '<div class="paper-toast-shortcut">' +
          '<div class="paper-key-group">' +
            '<kbd class="paper-key">&larr;</kbd>' +
            '<kbd class="paper-key">&rarr;</kbd>' +
          '</div>' +
          '<span class="paper-key-desc">Turn pages</span>' +
        '</div>' +
        '<div class="paper-toast-shortcut">' +
          '<div class="paper-key-group">' +
            '<kbd class="paper-key">Esc</kbd>' +
          '</div>' +
          '<span class="paper-key-desc">Return home</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(toast);

    // Small, transparent tip button that replaces the toast once it collapses
    const tipButton = document.createElement('button');
    tipButton.type = 'button';
    tipButton.className = 'paper-toast-tip';
    tipButton.setAttribute('aria-label', 'Show reading guide');
    tipButton.setAttribute('aria-controls', toast.id);
    tipButton.setAttribute('aria-expanded', 'false');
    tipButton.title = 'Reading guide';
    tipButton.innerHTML =
      '<svg class="paper-toast-tip-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .9 1.6l.1.6h5.2l.1-.6c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z" ' +
          'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    document.body.appendChild(tipButton);

    const closeBtn = toast.querySelector('.paper-toast-close');

    let fadeTimer = null;
    let collapseTimer = null;
    let isExpanded = false;

    function clearToastTimers() {
      clearTimeout(fadeTimer);
      clearTimeout(collapseTimer);
    }

    function startTimer(duration) {
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(collapseToast, duration);
    }

    function expandToast() {
      if (isExpanded) return;
      isExpanded = true;
      clearToastTimers();
      toast.removeAttribute('aria-hidden');
      tipButton.setAttribute('aria-expanded', 'true');
      tipButton.classList.remove('is-visible');
      // Let the browser paint the collapsed state before re-expanding
      requestAnimationFrame(function () {
        toast.classList.add('is-visible');
        // Keep keyboard focus usable when the tip button collapses away
        if (document.activeElement === tipButton && closeBtn) {
          closeBtn.focus();
        }
      });
      startTimer(TOAST_DURATION_MS);
    }

    function collapseToast() {
      if (!isExpanded) return;
      isExpanded = false;
      clearToastTimers();
      toast.classList.remove('is-visible');
      tipButton.setAttribute('aria-expanded', 'false');
      tipButton.classList.add('is-visible');

      // Hide the faded panel from assistive tech once the transition finishes
      collapseTimer = setTimeout(function () {
        toast.setAttribute('aria-hidden', 'true');
        if (toast.contains(document.activeElement)) {
          tipButton.focus();
        }
      }, TOAST_COLLAPSE_MS);
    }

    // Smooth entrance after initial page load
    if (isFirstVisit) {
      setTimeout(expandToast, 450);
    } else {
      toast.setAttribute('aria-hidden', 'true');
      tipButton.classList.add('is-visible');
    }

    // Close button collapses the guide instead of removing it
    if (closeBtn) {
      closeBtn.addEventListener('click', collapseToast);
    }

    // Re-open the guide from the collapsed tip button
    tipButton.addEventListener('click', expandToast);

    // Pause timer while user hovers cursor over the toast
    toast.addEventListener('mouseenter', function () {
      clearTimeout(fadeTimer);
    });

    toast.addEventListener('mouseleave', function () {
      if (isExpanded) {
        startTimer(3500); // Allow 3.5 seconds after cursor leaves
      }
    });
  }

  // Developer helper for easy testing in console
  window.resetBookNavToast = function () {
    try {
      sessionStorage.removeItem(TOAST_STORAGE_KEY);
      console.log('Book navigation toast reset. Reload or open a book to see it again.');
    } catch (e) {}
  };

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNavLinks();
      initArrowKeyNavigation();
      initEscapeNavigation();
      initPaperToast();
    });
  } else {
    initNavLinks();
    initArrowKeyNavigation();
    initEscapeNavigation();
    initPaperToast();
  }
})();
