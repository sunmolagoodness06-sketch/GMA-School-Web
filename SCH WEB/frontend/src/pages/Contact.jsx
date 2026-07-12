import React, { useState } from 'react';
import SVGIcon from '../components/icons/SVGIcon';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config/api';
import './Contact.css';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
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
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        setFormData(initialFormData);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          result.errors?.map((err) => err.msg).join(', ') ||
          result.message ||
          'There was an error sending your message. Please try again.'
        );
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('There was an error sending your message. Please try again.');
    }

    setIsSubmitting(false);
  };

  const contactDetails = [
    {
      icon: 'mapPin',
      title: 'Address',
      lines: ['Plot 16,', 'Goshen str, Off Odo-ona kekere, Ibadan', 'Nigeria']
    },
    {
      icon: 'phone',
      title: 'Phone',
      lines: ['+234 (0) 703 297 7267', '+234 (0) 813 690 3219']
    },
    {
      icon: 'mail',
      title: 'Email',
      lines: ['goodnessandmercyschool@gmail.com', 'admissions@gmaschool.edu.ng']
    },
    {
      icon: 'clock',
      title: 'Office Hours',
      lines: ['Monday - Friday: 8:00 AM - 5:00 PM', 'Saturday: 9:00 AM - 2:00 PM', 'Sunday: Closed']
    }
  ];

  return (
    <div className="contact">
      <SEO
        title="Contact Us"
        description="Get in touch with GMA School for admissions, inquiries, or to schedule a campus tour."
      />
      <PageHeader
        title="Contact Us"
        description="Get in touch with us for admissions, inquiries, or to schedule a campus tour."
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <div className="contact-details">
                {contactDetails.map((detail) => (
                  <div key={detail.title} className="contact-detail-card">
                    <div className="contact-detail-icon">
                      <SVGIcon name={detail.icon} size={22} />
                    </div>
                    <div>
                      <h4>{detail.title}</h4>
                      {detail.lines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-map">
                <h3>Campus Map</h3>
                <div className="contact-map-embed">
                  <iframe
                    title="GMA School Campus Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent('Plot 16, Goshen Str, Off Odo-Ona kekere, Ibadan, Nigeria')}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="card contact-form-card">
              <div className="card-header">
                <h3>Send us a Message</h3>
              </div>
              <div className="card-body">
                {submitStatus === 'success' && (
                  <div className="success-message">
                    <SVGIcon name="checkCircle" size={20} />
                    <span>{submitMessage}</span>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="error-message">
                    <SVGIcon name="alert-circle" size={20} />
                    <span>{submitMessage}</span>
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
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;