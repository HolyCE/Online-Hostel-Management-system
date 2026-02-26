import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '🚀',
      title: 'Lightning Fast Allocation',
      description: 'AI-powered room matching algorithm finds your perfect space instantly.',
    },
    {
      icon: '🔮',
      title: 'Predictive Analytics',
      description: 'Smart forecasting helps you plan ahead with confidence.',
    },
    {
      icon: '🌐',
      title: 'Global Integration',
      description: 'Connect with hostels worldwide through our extensive network.',
    },
    {
      icon: '⚡',
      title: 'Instant Payments',
      description: 'Secure transactions with multiple payment options.',
    },
    {
      icon: '🛡️',
      title: 'Bank-Level Security',
      description: 'Your data is protected with enterprise-grade encryption.',
    },
    {
      icon: '🤖',
      title: '24/7 AI Support',
      description: 'Get instant answers anytime, anywhere.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'STUDENTS' },
    { value: '500+', label: 'HOSTELS' },
    { value: '99.9%', label: 'UPTIME' },
    { value: '24/7', label: 'SUPPORT' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'University Dean',
      content: 'This platform has revolutionized how we manage student housing. Incredible efficiency gains!',
      avatar: '👩‍🏫',
      rating: 5,
    },
    {
      name: 'James Okonkwo',
      role: 'Student',
      content: 'Found my perfect room in minutes. The process was smooth and transparent.',
      avatar: '👨‍🎓',
      rating: 5,
    },
    {
      name: 'Maria Garcia',
      role: 'Hostel Owner',
      content: 'Management has never been easier. Automated systems save us hours every week.',
      avatar: '👩‍💼',
      rating: 5,
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section - Redesigned */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Experience the Future of<br />
            <span className="hero-title-gradient">Student Living</span>
          </h1>
          <p className="hero-subtitle">
            Welcome to HostelManager — the smartest way to find and manage<br />
            student accommodation. AI-powered, secure, and effortless.
          </p>
          <div className="hero-buttons">
            <button 
              className="hero-btn hero-btn-primary"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button 
              className="hero-btn hero-btn-outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - Moved outside hero
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-line">Why Choose</span>
              <span className="title-gradient">HostelManager?</span>
            </h2>
            <p className="section-subtitle">
              Experience features designed to make student living smarter and easier
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card"
                ref={(el) => (sectionRefs.current[index] = el)}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-line">What Our</span>
              <span className="title-gradient">Users Say</span>
            </h2>
            <p className="section-subtitle">
              Join thousands of satisfied students and administrators
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="testimonial-card"
                ref={(el) => (sectionRefs.current[features.length + index] = el)}
              >
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <span className="author-avatar">{testimonial.avatar}</span>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">
            Ready to Get Started?
          </h2>
          <p className="cta-subtitle">
            Join 50,000+ students who have already upgraded their living experience
          </p>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/register')}
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;