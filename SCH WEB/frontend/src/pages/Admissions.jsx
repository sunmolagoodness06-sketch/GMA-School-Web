import React, { useState } from 'react';

const Admissions = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    division: '',
    class: '',
    message: ''
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
      const response = await fetch('http://localhost:5000/api/public/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitMessage('Application submitted successfully! We will contact you soon.');
        setFormData({
          studentName: '',
          parentName: '',
          email: '',
          phone: '',
          division: '',
          class: '',
          message: ''
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
    <div className="admissions" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>Admissions</h1>
          <p>Join the GMA School family and give your child the best educational foundation.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3>Admission Requirements</h3>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '2rem' }}>
                <li>Completed application form</li>
                <li>Birth certificate</li>
                <li>Previous school records (if applicable)</li>
                <li>Passport photographs</li>
                <li>Medical certificate</li>
              </ul>
              
              <h3>Application Process</h3>
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>Submit online application</li>
                <li>Schedule entrance assessment</li>
                <li>Attend parent interview</li>
                <li>Receive admission decision</li>
                <li>Complete enrollment</li>
              </ol>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Application Form</h3>
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
                    <label className="form-label">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Parent/Guardian Name *</label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
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
                    <label className="form-label">Division *</label>
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Division</option>
                      <option value="nursery">Nursery & Early Years</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="college">College / Sixth Form</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Class/Grade *</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g., Nursery 1, Grade 5, JSS 2"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Additional Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Any additional information or questions..."
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

export default Admissions;