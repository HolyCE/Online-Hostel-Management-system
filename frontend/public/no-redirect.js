// Simple redirect - only redirect on login page if logged in
(function() {
  const token = localStorage.getItem('token');
  const isLoginPage = window.location.pathname === '/login';
  
  if (isLoginPage && token) {
    window.location.href = '/dashboard';
  }
})();
