import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, Globe, CreditCard, ShieldCheck, HeadphonesIcon } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
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
      icon: <Zap size={24} color="#000000" />,
      title: 'Lightning Fast Allocation',
      description: 'Smart room matching algorithm finds your perfect space instantly without the wait.',
    },
    {
      icon: <Activity size={24} color="#000000" />,
      title: 'Predictive Analytics',
      description: 'Advanced forecasting helps administrators plan capacity and maintenance ahead of time.',
    },
    {
      icon: <Globe size={24} color="#000000" />,
      title: 'Global Integration',
      description: 'Connect with payment gateways and university systems seamlessly.',
    },
    {
      icon: <CreditCard size={24} color="#000000" />,
      title: 'Instant Payments',
      description: 'Secure, automated fee collection and tracking with multiple payment options.',
    },
    {
      icon: <ShieldCheck size={24} color="#000000" />,
      title: 'Bank-Level Security',
      description: 'Student data is protected with enterprise-grade encryption and access controls.',
    },
    {
      icon: <HeadphonesIcon size={24} color="#000000" />,
      title: '24/7 Support Portal',
      description: 'Integrated ticketing system ensures student issues are resolved quickly.',
    },
  ];

  return (
    <div className="homepage">
      <Navbar />
      
      {/* Hero Section with Wave Ripple Animation */}
      <section className="hero-section">
        <div className="wave-container">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.3">
                  <animate attributeName="stop-color" values="#000000;#333333;#000000" dur="8s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#666666" stopOpacity="0.5">
                  <animate attributeName="stop-color" values="#333333;#666666;#333333" dur="8s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2">
                  <animate attributeName="stop-color" values="#666666;#ffffff;#666666" dur="8s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#wave-gradient)" fillOpacity="0.4">
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
                         M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,197.3C672,203,768,181,864,176C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z;
                         M0,224L48,218.7C96,213,192,203,288,192C384,181,480,171,576,176C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              />
            </path>
          </svg>
        </div>
        <div className="ripple-container">
          <div className="ripple ripple-1"></div>
          <div className="ripple ripple-2"></div>
          <div className="ripple ripple-3"></div>
        </div>
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
              className="heros-btn heros-btn-primary"
              onClick={() => navigate('/register')}
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;