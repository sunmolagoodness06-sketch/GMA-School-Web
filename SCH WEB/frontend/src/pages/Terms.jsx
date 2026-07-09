import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="terms" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>Terms of Service</h1>
          <p>The terms governing your use of the Goodness and Mercy Academy (GMA) website.</p>
          <div className="card">
            <div className="card-body">
              <h3>Using This Site</h3>
              <p>
                By using this website, you agree to provide accurate information when submitting
                forms (such as admissions applications), and to use the site only for its intended
                purpose of learning about and engaging with GMA School.
              </p>
              <p>
                Full terms are being finalized. For questions in the meantime, please reach out via
                our <Link to="/contact">Contact page</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
