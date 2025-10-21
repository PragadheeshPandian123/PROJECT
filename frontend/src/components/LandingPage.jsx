// frontend/src/components/LandingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      title: 'Manage Events Seamlessly',
      description: 'Streamline your college event management with our all-in-one platform'
    },
    {
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200',
      title: 'Easy Registration',
      description: 'Students can register for events with just a few clicks'
    },
    {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      title: 'Track Participation',
      description: 'Monitor attendance and manage participants effortlessly'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FaCalendarAlt />,
      title: 'Event Management',
      description: 'Create, edit, and manage college events with ease'
    },
    {
      icon: <FaUsers />,
      title: 'Student Registration',
      description: 'Simple and quick registration process for students'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Venue Management',
      description: 'Track and manage event venues efficiently'
    },
    {
      icon: <FaChartLine />,
      title: 'Real-time Analytics',
      description: 'Monitor event participation and statistics'
    }
  ];

  return (
    <div className="landing-container">
      {/* Hero Section with Slider */}
      <div className="hero-section">
        <div className="hero-overlay" />
        
        {/* Slider */}
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${currentSlide === index ? 'active' : ''}`}
            >
              <img src={slide.url} alt={slide.title} className="slide-image" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="logo-section">
            <h1 className="logo-text">Evently</h1>
            <p className="tagline">College Event Management System</p>
          </div>

          <div className="hero-text-container">
            <h2 className="hero-title">{slides[currentSlide].title}</h2>
            <p className="hero-description">{slides[currentSlide].description}</p>
          </div>

          <div className="cta-buttons">
            <button 
              className="primary-btn"
              onClick={() => navigate('/signin')}
            >
              Sign In <FaArrowRight className="btn-icon" />
            </button>
            <button 
              className="secondary-btn"
              onClick={() => navigate('/signup')}
            >
              Register Now
            </button>
          </div>

          {/* Slider Dots */}
          <div className="dots-container">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose Evently?</h2>
        <p className="section-subtitle">
          Everything you need to manage college events in one powerful platform
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <div className="about-content">
          <h2 className="about-title">About Evently</h2>
          <p className="about-text">
            Evently is a comprehensive event management solution designed specifically for educational institutions. 
            Our platform simplifies the entire event lifecycle - from creation and registration to attendance tracking 
            and analytics.
          </p>
          <p className="about-text">
            Whether you're an administrator managing multiple events, an organizer creating engaging experiences, 
            or a student looking to participate, Evently provides the tools you need to make every event a success.
          </p>
          <div className="stats-container">
            <div className="stat-item">
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">Events Managed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">5000+</h3>
              <p className="stat-label">Active Students</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">50+</h3>
              <p className="stat-label">Venues Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="footer-cta">
        <h2 className="footer-title">Ready to Get Started?</h2>
        <p className="footer-text">Join thousands of students and organizers using Evently</p>
        <button 
          className="footer-btn"
          onClick={() => navigate('/signup')}
        >
          Create Your Account
        </button>
      </div>
    </div>
  );
};

export default LandingPage;