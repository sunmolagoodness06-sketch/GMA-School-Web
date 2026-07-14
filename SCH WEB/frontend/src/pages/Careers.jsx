import React, { useState } from 'react';
import SVGIcon from '../components/icons/SVGIcon';
import PageHeader from '../components/PageHeader';
import FileUploadField from '../components/FileUploadField';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config/api';
import './Careers.css';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  experience: '',
  education: ''
};

const Careers = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [coverLetter, setCoverLetter] = useState(null);
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

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) payload.append(key, value);
    });
    if (coverLetter) payload.append('coverLetter', coverLetter);

    try {
      const response = await fetch(`${API_BASE_URL}/public/careers/apply`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        setFormData(initialFormData);
        setCoverLetter(null);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          result.errors?.map((err) => err.msg).join(', ') ||
          result.message ||
          'There was an error submitting your application. Please try again.'
        );
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('There was an error submitting your application. Please try again.');
    }

    setIsSubmitting(false);
  };

  const benefits = [
    {
      icon: 'trendingUp',
      title: 'Professional Growth',
      description: 'Continuous professional development opportunities and career advancement.'
    },
    {
      icon: 'users',
      title: 'Collaborative Environment',
      description: 'Work with passionate educators in a supportive and innovative environment.'
    },
    {
      icon: 'award',
      title: 'Competitive Benefits',
      description: 'Attractive salary packages, health insurance, and other benefits.'
    }
  ];

  const openings = [
    'Mathematics Teacher (Secondary)',
    'English Teacher (Primary)',
    'Science Laboratory Assistant',
    'ICT Coordinator',
    'School Counselor',
    'Administrative Assistant'
  ];

  return (
    <div className="careers">
      <SEO
        title="Careers"
        description="Join the GMA School team — explore open teaching and staff positions and apply online."
      />
      <PageHeader
        title="Join Our Team"
        description="Be part of our mission to provide excellent education and shape young minds."
      />

      <section className="section">
        <div className="container">
          <div className="careers-grid">
            <div className="careers-info">
              <h2>Why Work at GMA School?</h2>
              <div className="careers-benefits">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="careers-benefit-card">
                    <div className="careers-benefit-icon">
                      <SVGIcon name={benefit.icon} size={24} />
                    </div>
                    <div>
                      <h4>{benefit.title}</h4>
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="careers-openings-title">
                <SVGIcon name="briefcase" size={20} />
                Current Openings
              </h3>
              <ul className="careers-openings-list">
                {openings.map((role) => (
                  <li key={role}>
                    <SVGIcon name="check" size={16} />
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card careers-form-card">
              <div className="card-header">
                <h3>Apply Now</h3>
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

                  <FileUploadField
                    label="Cover Letter"
                    name="coverLetter"
                    accept=".pdf,image/*"
                    required
                    hint="PDF or image, up to 5MB"
                    file={coverLetter}
                    onChange={setCoverLetter}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
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

export default Careers;