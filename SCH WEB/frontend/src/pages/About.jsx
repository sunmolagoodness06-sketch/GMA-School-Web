import React from 'react';
import { Link } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';
import PageHeader from '../components/PageHeader';
import './About.css';

const About = () => {
  const values = [
    {
      icon: 'award',
      title: 'Excellence',
      description: 'We hold ourselves to the highest academic and professional standards in everything we do.'
    },
    {
      icon: 'heart',
      title: 'Character',
      description: 'We nurture integrity, empathy, and strong moral values alongside academic achievement.'
    },
    {
      icon: 'users',
      title: 'Community',
      description: 'We build a supportive family of students, parents, and educators who grow together.'
    },
    {
      icon: 'lightbulb',
      title: 'Innovation',
      description: 'We embrace modern teaching methods and technology to prepare students for the future.'
    }
  ];

  const leadership = [
    { role: 'Head of School' },
    { role: 'Vice Principal' },
    { role: 'Head of Academics' },
    { role: 'Head of Admissions' }
  ];

  const accreditations = [
    'Accreditation Name',
    'Accreditation Name',
    'Accreditation Name'
  ];

  return (
    <div className="about">
      <PageHeader
        title="About Goodness and Mercy Academy"
        description="Excellence in Education, Character in Life — nurturing young minds from nursery through college since 2014."
      />

      {/* Our Story */}
      <section className="section about-story">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <h2>Our Story</h2>
              <p>
                GMA School — short for <strong>Goodness and Mercy Academy</strong> — was founded in 2014
                with a simple conviction: that academic excellence and strong character are not
                separate goals, but two halves of the same mission.
              </p>
              <p>
                Since then, we've grown into a full educational journey spanning nursery through
                college preparation, guided by dedicated educators and a curriculum built to meet
                international standards while staying rooted in the values that shaped our founding.
              </p>
            </div>
            <div className="about-story-stats">
              <div className="about-stat">
                <div className="about-stat-number">2014</div>
                <div className="about-stat-label">Founded</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-number">12+</div>
                <div className="about-stat-label">Years of Excellence</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-number">4</div>
                <div className="about-stat-label">Academic Divisions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-lg bg-surface">
        <div className="container">
          <div className="about-mission-grid">
            <div className="about-mission-card">
              <div className="about-mission-icon">
                <SVGIcon name="target" size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide world-class education that nurtures academic excellence, character
                development, and global citizenship.
              </p>
            </div>
            <div className="about-mission-card">
              <div className="about-mission-icon">
                <SVGIcon name="globe" size={32} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the leading educational institution that prepares students for success in a
                rapidly changing world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <p className="section-description">
              The principles that guide every decision we make and every student we teach.
            </p>
          </div>
          <div className="about-values-grid grid grid-auto-fit">
            {values.map((value) => (
              <div key={value.title} className="about-value-card">
                <div className="about-value-icon">
                  <SVGIcon name={value.icon} size={28} />
                </div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section-lg bg-surface">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-description">
              Meet the passionate educators leading GMA School. Photos and bios coming soon.
            </p>
          </div>
          <div className="about-leadership-grid grid grid-auto-fit">
            {leadership.map((leader) => (
              <div key={leader.role} className="leader-card">
                <div className="leader-photo-placeholder">
                  <SVGIcon name="user" size={36} />
                </div>
                <h4>Leader Name</h4>
                <span className="leader-title">{leader.role}</span>
                <p className="leader-placeholder-note">Photo &amp; bio coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Accreditations &amp; Affiliations</h2>
            <p className="section-description">Details coming soon.</p>
          </div>
          <div className="about-accreditations">
            {accreditations.map((name, index) => (
              <div key={index} className="accreditation-badge">
                <SVGIcon name="award" size={28} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg cta-section bg-gradient-gold">
        <div className="container">
          <div className="cta-content text-center">
            <div className="cta-icon">
              <SVGIcon name="graduation" size={48} />
            </div>
            <h2>Come See Us for Yourself</h2>
            <p className="lead">
              The best way to understand GMA School is to visit us. Schedule a campus tour or start
              your application today.
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
