// Prevent redirect to login if we have a valid token
(function() {
  console.log('🔒 Redirect protection active');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const currentPath = window.location.pathname;
  
  // If we're on login page but have a token, redirect to dashboard
  if (currentPath === '/login' && token && user) {
    console.log('✅ Token found, redirecting to dashboard');
    window.location.href = '/dashboard';
    return;
  }
  
  // Intercept navigation to login
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  const checkAndBlock = (url) => {
    if (url && url.includes('/login') && token && user) {
      console.log('🚫 Blocked navigation to login');
      return true;
    }
    return false;
  };
  
  history.pushState = function(...args) {
    const url = args[2];
    if (checkAndBlock(url)) return;
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    const url = args[2];
    if (checkAndBlock(url)) return;
    return originalReplaceState.apply(this, args);
  };
  
  // Also intercept clicks on links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === '/login' && token && user) {
      e.preventDefault();
      console.log('🚫 Blocked login link click');
      window.location.href = '/dashboard';
    }
  });
})();
