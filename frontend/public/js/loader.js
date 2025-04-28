// Function to hide loader with fade out
function hideLoader() {
    const loader = document.getElementById('page-transition');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500); // match CSS transition duration
    }
  }
  
  // Function to show loader
  function showLoader() {
    const loader = document.getElementById('page-transition');
    if (loader) {
      loader.style.display = 'flex';
      // Force reflow to restart CSS transition
      void loader.offsetWidth;
      loader.style.opacity = '1';
    }
  }
  
  // Hide loader when page fully loads
  window.addEventListener('load', hideLoader);
  
  // Handle pageshow event to hide loader when navigating back/forward
  window.addEventListener('pageshow', (event) => {
    // If persisted (from bfcache), hide loader immediately
    if (event.persisted) {
      hideLoader();
    }
  });
  
  // Show loader before navigating to another page via internal links
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (
      link.getAttribute('target') === '_blank' || 
      !href || 
      href.startsWith('#') || 
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return; // Ignore external, new tab, mailto, tel links
    }
  
    link.addEventListener('click', function (e) {
      e.preventDefault(); // prevent default navigation
      const destination = this.href;
  
      showLoader();
  
      setTimeout(() => {
        window.location.href = destination;
      }, 500); // match CSS transition duration
    });
  });
  
  // Optional: Show loader on beforeunload to cover non-link navigations (e.g., form submits, manual URL change)
  window.addEventListener('beforeunload', () => {
    showLoader();
  });
  