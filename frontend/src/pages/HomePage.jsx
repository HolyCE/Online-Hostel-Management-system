import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, Globe, CreditCard, ShieldCheck, HeadphonesIcon } from 'lucide-react';
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
      icon: <Zap size={24} color="#a1a1aa" />,
      title: 'Lightning Fast Allocation',
      description: 'Smart room matching algorithm finds your perfect space instantly without the wait.',
    },
    {
      icon: <Activity size={24} color="#a1a1aa" />,
      title: 'Predictive Analytics',
      description: 'Advanced forecasting helps administrators plan capacity and maintenance ahead of time.',
    },
    {
      icon: <Globe size={24} color="#a1a1aa" />,
      title: 'Global Integration',
      description: 'Connect with payment gateways and university systems seamlessly.',
    },
    {
      icon: <CreditCard size={24} color="#a1a1aa" />,
      title: 'Instant Payments',
      description: 'Secure, automated fee collection and tracking with multiple payment options.',
    },
    {
      icon: <ShieldCheck size={24} color="#a1a1aa" />,
      title: 'Bank-Level Security',
      description: 'Student data is protected with enterprise-grade encryption and access controls.',
    },
    {
      icon: <HeadphonesIcon size={24} color="#a1a1aa" />,
      title: '24/7 Support Portal',
      description: 'Integrated ticketing system ensures student issues are resolved quickly.',
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">HostelManager 2.0 is live</div>
          <h1 className="hero-title">
            The modern operating system for <br />
            <span className="hero-title-gradient">student accommodation.</span>
          </h1>
          <p className="hero-subtitle">
            Automate allocations, manage maintenance, and track payments all in one sleek, secure platform designed for the future of living.
          </p>
          <div className="hero-buttons">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </button>
            <button
              className="hero-btn hero-btn-outline"
              onClick={() => navigate('/login')}
            >
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need to scale</h2>
            <p className="section-subtitle">
              Purpose-built tools that give administrators total control and students total comfort.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                ref={(el) => (sectionRefs.current[index] = el)}
              >
                <div className="feature-icon-wrapper">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-title">Ready to modernize your hostel?</h2>
            <p className="cta-subtitle">
              Join progressive institutions that have already upgraded their students' living experience.
            </p>
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigate('/register')}
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;