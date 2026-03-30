// Simple redirect protection - only redirects when on login page with token
(function() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const currentPath = window.location.pathname;
  
  // Only redirect if we're on login page and have a token
  if (currentPath === '/login' && token && user) {
    console.log('✅ Redirecting to dashboard');
    window.location.href = '/dashboard';
  }
})();
