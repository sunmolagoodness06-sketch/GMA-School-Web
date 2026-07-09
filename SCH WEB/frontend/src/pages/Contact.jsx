import React, { useState } from 'react';
import SVGIcon from '../components/icons/SVGIcon';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      const response = await fetch('http://localhost:5000/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage('There was an error sending your message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('There was an error sending your message. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="contact" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section">
          <h1>Contact Us</h1>
          <p>Get in touch with us for admissions, inquiries, or to schedule a campus tour.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
            <div>
              <h2>Get in Touch</h2>
              
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>
                    <SVGIcon name="mapPin" size={20} />
                    Address
                  </h4>
                  <p>Plot 16,<br />Goshen str, Off Odo-ona kekere, Ibadan<br />Nigeria</p>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>
                    <SVGIcon name="phone" size={20} />
                    Phone
                  </h4>
                  <p>+234 (0) 703 297 7267 <br />+234 (0) 813 690 3219</p>
                </div>
              </div>
              
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h4>
                    <SVGIcon name="mail" size={20} />
                    Email
                  </h4>
                  <p>goodnessandmercyschool@gmail.com<br />admissions@gmaschool.edu.ng</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body">
                  <h4>
                    <SVGIcon name="clock" size={20} />
                    Office Hours
                  </h4>
                  <p>Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 2:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <h3>Campus Map</h3>
                <div style={{ 
                  height: '300px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  marginTop: '1rem'
                }}>
                  <p>Interactive Google Maps will be embedded here</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Send us a Message</h3>
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
                      name="name"
                      value={formData.name}
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
                    <label className="form-label">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="admissions">Admissions Inquiry</option>
                      <option value="tour">Campus Tour Request</option>
                      <option value="academics">Academic Programs</option>
                      <option value="fees">Fees and Payment</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Please provide details about your inquiry..."
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
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

export default Contact;