// Keep content visible even when scripts or fonts cannot load.
// The browser handles navigation and back/forward restoration natively.
(function () {
  document.body.classList.add('loaded');
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('leaving');
  });
})();
