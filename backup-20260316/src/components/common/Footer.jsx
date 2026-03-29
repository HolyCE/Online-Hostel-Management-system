import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  const resources = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Help Center', path: '/help' },
  ];

  const socialLinks = [
    { icon: '𝕏', label: 'X (Twitter)', url: '#' },
    { icon: '📘', label: 'Facebook', url: '#' },
    { icon: '📷', label: 'Instagram', url: '#' },
    { icon: '💼', label: 'LinkedIn', url: '#' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo" onClick={() => handleNavigation('/')}>
              <span className="logo-icon">🏨</span>
              <span className="logo-text">
                Hostel<span className="logo-highlight">Manager</span>
              </span>
            </div>
            <p className="brand-description">
              The future of student accommodation management. 
              Smart, secure, and seamless living experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="links-title">Quick Links</h3>
            <div className="links-list">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  className="footer-link"
                  onClick={() => handleNavigation(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="footer-links">
            <h3 className="links-title">Resources</h3>
            <div className="links-list">
              {resources.map((link, index) => (
                <button
                  key={index}
                  className="footer-link"
                  onClick={() => handleNavigation(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div className="footer-contact">
            <h3 className="links-title">Connect With Us</h3>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:hello@hostelmanager.com">hello@hostelmanager.com</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <a href="tel:+2341234567890">+234 123 456 7890</a>
              </div>
            </div>

            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="newsletter">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} HostelManager. All rights reserved.
          </p>
          <div className="bottom-links">
            <button className="bottom-link" onClick={() => handleNavigation('/privacy')}>
              Privacy
            </button>
            <button className="bottom-link" onClick={() => handleNavigation('/terms')}>
              Terms
            </button>
            <button className="bottom-link" onClick={() => handleNavigation('/cookies')}>
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
