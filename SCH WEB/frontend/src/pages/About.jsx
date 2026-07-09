import React from 'react';

const About = () => {
  return (
    <div className="about" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>About GMA School</h1>
          <p>Learn about our mission, vision, and commitment to educational excellence.</p>
          <div className="card">
            <div className="card-body">
              <h3>Our Mission</h3>
              <p>To provide world-class education that nurtures academic excellence, character development, and global citizenship.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h3>Our Vision</h3>
              <p>To be the leading educational institution that prepares students for success in a rapidly changing world.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;