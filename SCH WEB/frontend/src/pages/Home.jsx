import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';
import HeroIllustration from '../components/HeroIllustration';
import './Home.css';

const Home = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: 'graduation',
      title: 'Academic Excellence',
      description: 'Rigorous curriculum aligned with international standards, preparing students for global universities and future success.',
      delay: 'stagger-1',
      link: '/academics'
    },
    {
      icon: 'users',
      title: 'Character Development',
      description: 'Building strong moral values, leadership skills, and social responsibility in every student through comprehensive programs.',
      delay: 'stagger-2',
      link: '/about'
    },
    {
      icon: 'heart',
      title: 'Holistic Growth',
      description: 'Sports, arts, technology, and extracurricular activities for well-rounded development and personal discovery.',
      delay: 'stagger-3',
      link: '/academics#co-curricular'
    },
    {
      icon: 'building',
      title: 'Modern Facilities',
      description: 'State-of-the-art classrooms, laboratories, library, and technology infrastructure supporting innovative learning.',
      delay: 'stagger-4',
      link: '/contact'
    }
  ];

  const divisions = [
    {
      icon: 'lightbulb',
      title: 'Nursery & Early Years',
      subtitle: 'Ages 2-5',
      description: 'Foundation learning through play-based activities and structured programs that nurture curiosity and creativity.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: 'bookOpen',
      title: 'Primary School',
      subtitle: 'Ages 6-11',
      description: 'Building strong foundations in literacy, numeracy, and critical thinking with personalized attention.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: 'graduation',
      title: 'Secondary School',
      subtitle: 'Ages 12-16',
      description: 'Comprehensive curriculum preparing for national and international examinations with excellence.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: 'award',
      title: 'College / Sixth Form',
      subtitle: 'Ages 17-18',
      description: 'Advanced studies and university preparation programs with career guidance and mentorship.',
      color: 'from-gold-400 to-gold-600'
    }
  ];

  const stats = [
    { number: '12+', label: 'Years of Excellence', icon: 'calendar' },
    { number: '1000+', label: 'Successful Graduates', icon: 'users' },
    { number: '98%', label: 'University Admission', icon: 'trendingUp' },
    { number: '50+', label: 'Expert Teachers', icon: 'award' }
  ];

  const testimonials = [
    {
      quote: "GMA School has transformed my daughter's approach to learning. The teachers are exceptional, and the holistic development program has built her confidence tremendously.",
      author: 'Mrs. Adebayo Johnson',
      role: 'Parent of Sarah, Grade 8'
    },
    {
      quote: "The international curriculum and modern facilities at GMA prepared my son excellently for university. He's now studying at Oxford University!",
      author: 'Dr. Emmanuel Okafor',
      role: 'Parent of Michael, Alumni'
    },
    {
      quote: "From nursery to secondary school, GMA has been our family's educational home. The values and excellence they instill are unmatched.",
      author: 'Mrs. Fatima Al-Hassan',
      role: 'Parent of Amina & Ahmed'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-main">
              <div className="hero-text fade-in">
                <div className="hero-badge">
                  <SVGIcon name="star" size={16} />
                  <span>Ranked #1 International School in Ibadan</span>
                </div>
                <h1 className="hero-title">
                  Excellence in Education,
                  <span className="text-gold"> Character in Life</span>
                </h1>
                <p className="hero-description lead">
                  At Goodness & Mercy Academy (GMA), we nurture young minds from nursery through college,
                  providing world-class education that prepares students for global success
                  while building strong moral foundations for life.
                </p>
                <div className="hero-actions">
                  <Link to="/admissions" className="btn btn-primary btn-xl">
                    <SVGIcon name="arrowRight" size={20} />
                    Apply Now
                  </Link>
                  <Link to="/contact" className="btn btn-outline btn-xl">
                    <SVGIcon name="calendar" size={20} />
                    Book a Tour
                  </Link>
                </div>
              </div>
              <div className="hero-visual scale-in stagger-2" aria-hidden="true">
                <HeroIllustration />
              </div>
            </div>
            <div className="hero-stats-bar fade-in stagger-2">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-item scale-in stagger-${index + 1}`}>
                  <div className="stat-icon">
                    <SVGIcon name={stat.icon} size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose GMA Section */}
      <section className="section why-choose">
        <div className="container">
          <div className="section-header slide-up">
            <h2 className="section-title">Why Choose GMA School?</h2>
            <p className="section-description">
              We provide a comprehensive educational experience that goes beyond academics, 
              nurturing the whole child for success in an ever-changing world.
            </p>
          </div>
          <div className="features-grid grid grid-auto-fit">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={`feature-card slide-up ${feature.delay}`}
              >
                <div className="feature-icon">
                  <SVGIcon name={feature.icon} size={32} />
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="feature-arrow">
                  <span>Learn More</span>
                  <SVGIcon name="arrowRight" size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions Overview */}
      <section className="section-lg bg-surface divisions">
        <div className="container">
          <div className="section-header slide-up">
            <h2 className="section-title">Our Academic Divisions</h2>
            <p className="section-description">
              Comprehensive education journey from early years through college preparation, 
              designed to unlock every student's potential at every stage.
            </p>
          </div>
          <div className="divisions-grid grid grid-auto-fit">
            {divisions.map((division, index) => (
              <div key={index} className={`division-card slide-up stagger-${index + 1}`}>
                <div className="division-header">
                  <div className="division-icon">
                    <SVGIcon name={division.icon} size={40} />
                  </div>
                  <div className="division-badge">{division.subtitle}</div>
                </div>
                <div className="division-content">
                  <h3>{division.title}</h3>
                  <p>{division.description}</p>
                  <Link to="/academics" className="division-link link-underline">
                    Learn More
                    <SVGIcon name="arrowRight" size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header slide-up">
            <h2 className="section-title">What Parents Say</h2>
            <p className="section-description">
              Hear from our community of parents who trust us with their children's education and future.
            </p>
          </div>
          <div className="testimonials-marquee">
            <div className="testimonials-track">
              {testimonials.map((t, index) => (
                <div className="testimonial-card" key={`a-${index}`}>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <SVGIcon key={i} name="starFilled" size={16} color="var(--color-gold)" />
                    ))}
                  </div>
                  <blockquote>"{t.quote}"</blockquote>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <cite>{t.author}</cite>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
              {testimonials.map((t, index) => (
                <div className="testimonial-card" key={`b-${index}`} aria-hidden="true">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <SVGIcon key={i} name="starFilled" size={16} color="var(--color-gold)" />
                    ))}
                  </div>
                  <blockquote>"{t.quote}"</blockquote>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <cite>{t.author}</cite>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-lg cta-section bg-gradient-gold">
        <div className="container">
          <div className="cta-content text-center slide-up">
            <div className="cta-icon">
              <SVGIcon name="graduation" size={48} />
            </div>
            <h2>Ready to Join the GMA Family?</h2>
            <p className="lead">
              Take the first step towards your child's bright future. Our admissions team is ready 
              to guide you through the process and answer all your questions.
            </p>
            <div className="cta-actions">
              <Link to="/admissions" className="btn btn-primary btn-xl">
                <SVGIcon name="user" size={20} />
                Start Application
              </Link>
              <Link to="/contact" className="btn btn-outline btn-xl">
                <SVGIcon name="phone" size={20} />
                Schedule Tour
              </Link>
            </div>
            <div className="cta-note">
              <SVGIcon name="checkCircle" size={16} />
              <span>No application fee • Quick response • Personal consultation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;