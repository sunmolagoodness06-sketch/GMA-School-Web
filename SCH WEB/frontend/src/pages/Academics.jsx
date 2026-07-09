import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SVGIcon from '../components/icons/SVGIcon';

const Academics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className="academics" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>Academic Programs</h1>
          <p>Comprehensive education from nursery through college preparation.</p>
          
          <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
            <div className="card scroll-anchor" id="nursery">
              <div className="card-header">
                <h3>
                  <SVGIcon name="lightbulb" size={24} />
                  Nursery & Early Years (Ages 2-5)
                </h3>
              </div>
              <div className="card-body">
                <p>Foundation learning through play-based activities, early literacy, numeracy, and social skills development.</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                  <li>Play-based learning approach</li>
                  <li>Early literacy and numeracy</li>
                  <li>Social and emotional development</li>
                  <li>Creative arts and music</li>
                </ul>
              </div>
            </div>
            
            <div className="card scroll-anchor" id="primary">
              <div className="card-header">
                <h3>
                  <SVGIcon name="bookOpen" size={24} />
                  Primary School (Ages 6-11)
                </h3>
              </div>
              <div className="card-body">
                <p>Building strong foundations in core subjects with emphasis on critical thinking and problem-solving skills.</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                  <li>English Language & Literature</li>
                  <li>Mathematics & Science</li>
                  <li>Social Studies & History</li>
                  <li>Computer Studies & Technology</li>
                  <li>Physical Education & Sports</li>
                </ul>
              </div>
            </div>
            
            <div className="card scroll-anchor" id="secondary">
              <div className="card-header">
                <h3>
                  <SVGIcon name="graduation" size={24} />
                  Secondary School (Ages 12-16)
                </h3>
              </div>
              <div className="card-body">
                <p>Comprehensive curriculum preparing students for WAEC, NECO, and international examinations.</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                  <li>Core subjects: English, Mathematics, Sciences</li>
                  <li>Elective subjects based on career interests</li>
                  <li>Laboratory practicals and research projects</li>
                  <li>Leadership and entrepreneurship programs</li>
                </ul>
              </div>
            </div>
            
            <div className="card scroll-anchor" id="college">
              <div className="card-header">
                <h3>
                  <SVGIcon name="award" size={24} />
                  College / Sixth Form (Ages 17-18)
                </h3>
              </div>
              <div className="card-body">
                <p>Advanced studies and university preparation with focus on specialized subjects and career guidance.</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                  <li>A-Level and JAMB preparation</li>
                  <li>University application guidance</li>
                  <li>Career counseling and mentorship</li>
                  <li>Research and independent study projects</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '3rem' }}>
            <h2>Co-curricular Activities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div className="card">
                <div className="card-body">
                  <h4>Sports & Athletics</h4>
                  <p>Football, Basketball, Athletics, Swimming, and more.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h4>Arts & Culture</h4>
                  <p>Music, Drama, Visual Arts, and Cultural performances.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h4>STEM Clubs</h4>
                  <p>Robotics, Coding, Science Fair, and Innovation labs.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h4>Leadership</h4>
                  <p>Student Government, Debate Club, and Community Service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academics;