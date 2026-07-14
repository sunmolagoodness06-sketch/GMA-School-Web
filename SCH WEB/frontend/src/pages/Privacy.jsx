import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Privacy = () => {
  return (
    <div className="privacy" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <SEO title="Privacy Policy" description="How Goodness and Mercy Academy collects, uses, and protects your information." />
      <div className="container">
        <div className="section">
          <h1>Privacy Policy</h1>
          <p>How Goodness and Mercy Academy (GMA) collects, uses, and protects your information.</p>
          <div className="card">
            <div className="card-body">
              <h3>Our Commitment</h3>
              <p>
                We take the privacy of our students, parents, and staff seriously. This page will
                outline in detail what information we collect through this website (such as
                admissions and contact form submissions), how it is used, and how it is safeguarded.
              </p>
              <p>
                Full policy details are being finalized. In the meantime, if you have any questions
                about how your data is handled, please reach out via our{' '}
                <Link to="/contact">Contact page</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
