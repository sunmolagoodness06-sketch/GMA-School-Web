import React, { useState } from 'react';

const Careers = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    coverLetter: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/public/careers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitMessage('Application submitted successfully! We will review and contact you soon.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          education: '',
          coverLetter: ''
        });
      } else {
        setSubmitMessage('There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('There was an error submitting your application. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="careers" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>Join Our Team</h1>
          <p>Be part of our mission to provide excellent education and shape young minds.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
            <div>
              <h2>Why Work at GMA School?</h2>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>Professional Growth</h4>
                  <p>Continuous professional development opportunities and career advancement.</p>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>Collaborative Environment</h4>
                  <p>Work with passionate educators in a supportive and innovative environment.</p>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>Competitive Benefits</h4>
                  <p>Attractive salary packages, health insurance, and other benefits.</p>
                </div>
              </div>
              
              <h3>Current Openings</h3>
              <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                <li>Mathematics Teacher (Secondary)</li>
                <li>English Teacher (Primary)</li>
                <li>Science Laboratory Assistant</li>
                <li>ICT Coordinator</li>
                <li>School Counselor</li>
                <li>Administrative Assistant</li>
              </ul>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Apply Now</h3>
              </div>
              <div className="card-body">
                {submitMessage && (
                  <div style={{ 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    color: '#0c4a6e'
                  }}>
                    {submitMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Position Applied For *</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Position</option>
                      <option value="teacher-mathematics">Mathematics Teacher</option>
                      <option value="teacher-english">English Teacher</option>
                      <option value="lab-assistant">Science Laboratory Assistant</option>
                      <option value="ict-coordinator">ICT Coordinator</option>
                      <option value="counselor">School Counselor</option>
                      <option value="admin-assistant">Administrative Assistant</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Highest Education *</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Education Level</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="diploma">Diploma/Certificate</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Cover Letter *</label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Tell us why you want to join GMA School and what you can bring to our team..."
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;