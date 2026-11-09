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

  // Paper tip toast for first-time book readers
  const TOAST_STORAGE_KEY = 'great_books_toast_shown';
  const TOAST_DURATION_MS = 8500; // 8.5 seconds display time

  function initPaperToast() {
    try {
      if (sessionStorage.getItem(TOAST_STORAGE_KEY)) {
        return;
      }
      sessionStorage.setItem(TOAST_STORAGE_KEY, 'true');
    } catch (e) {
      // In case session storage is restricted
    }

    const toast = document.createElement('aside');
    toast.className = 'paper-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-label', 'Keyboard Navigation Tip');

    toast.innerHTML =
      '<button type="button" class="paper-toast-close" aria-label="Dismiss reading guide">&times;</button>' +
      '<div class="paper-toast-header">' +
        '<span class="paper-toast-pin" aria-hidden="true">&#10022;</span>' +
        '<span class="paper-toast-title">Reading Guide</span>' +
      '</div>' +
      '<p class="paper-toast-intro">Navigate the collection with arrow keys:</p>' +
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
      '</div>';

    document.body.appendChild(toast);

    let fadeTimer = null;
    let removeTimer = null;
    let isFading = false;

    function dismissToast() {
      if (isFading) return;
      isFading = true;
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      toast.classList.remove('is-visible');
      toast.classList.add('is-fading');
      removeTimer = setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 700);
    }

    function startTimer(duration) {
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(dismissToast, duration);
    }

    // Smooth entrance after initial page load
    setTimeout(function () {
      toast.classList.add('is-visible');
      startTimer(TOAST_DURATION_MS);
    }, 450);

    // Close button
    const closeBtn = toast.querySelector('.paper-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', dismissToast);
    }

    // Pause timer while user hovers cursor over the toast
    toast.addEventListener('mouseenter', function () {
      clearTimeout(fadeTimer);
    });

    toast.addEventListener('mouseleave', function () {
      if (!isFading) {
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
      initPaperToast();
    });
  } else {
    initNavLinks();
    initArrowKeyNavigation();
    initPaperToast();
  }
})();
