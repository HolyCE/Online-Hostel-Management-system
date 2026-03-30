// Simple redirect protection with login flag
(function() {
  // Check if we just logged in
  const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const currentPath = window.location.pathname;
  
  // If we just logged in, don't redirect
  if (justLoggedIn) {
    console.log('🎉 Just logged in, skipping redirect');
    sessionStorage.removeItem('justLoggedIn');
    return;
  }
  
  // Only redirect if we're on login page and have a token
  if (currentPath === '/login' && token && user) {
    console.log('✅ Redirecting to dashboard');
    window.location.href = '/dashboard';
  }
})();
