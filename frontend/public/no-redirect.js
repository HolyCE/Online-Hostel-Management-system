// Prevent redirect to login only if we're NOT trying to log out
(function() {
  console.log('🔒 Redirect protection active');
  
  // Check if we're intentionally logging out
  const isLoggingOut = () => {
    return sessionStorage.getItem('loggingOut') === 'true' || 
           window.location.search.includes('logout=true');
  };
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const currentPath = window.location.pathname;
  
  // Clear logout flag when on login page
  if (currentPath === '/login') {
    sessionStorage.removeItem('loggingOut');
    console.log('🧹 Cleared logout flag');
  }
  
  // Only redirect to dashboard if:
  // 1. We're on login page
  // 2. We have a token
  // 3. We're NOT logging out
  if (currentPath === '/login' && token && user && !isLoggingOut()) {
    console.log('✅ Token found, redirecting to dashboard');
    window.location.href = '/dashboard';
    return;
  }
  
  // Intercept navigation to login
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    const url = args[2];
    const isLoginUrl = url && url.includes('/login');
    if (isLoginUrl && token && user && !isLoggingOut()) {
      console.log('🚫 Blocked navigation to login');
      return;
    }
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    const url = args[2];
    const isLoginUrl = url && url.includes('/login');
    if (isLoginUrl && token && user && !isLoggingOut()) {
      console.log('🚫 Blocked navigation to login');
      return;
    }
    return originalReplaceState.apply(this, args);
  };
  
  // Add global logout helper
  window.logoutAndRedirect = function() {
    console.log('🚪 Setting logout flag');
    sessionStorage.setItem('loggingOut', 'true');
    // Small delay to ensure flag is set
    setTimeout(() => {
      window.location.href = '/login?logout=true';
    }, 50);
  };
})();
