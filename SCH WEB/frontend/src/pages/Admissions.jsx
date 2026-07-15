import React, { useState } from 'react';
import SVGIcon from '../components/icons/SVGIcon';
import PageHeader from '../components/PageHeader';
import FileUploadField from '../components/FileUploadField';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config/api';
import './Admissions.css';

const initialFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  divisionApplied: '',
  classApplied: '',
  sessionApplied: '',
  fatherName: '',
  fatherEmail: '',
  fatherPhone: '',
  motherName: '',
  motherEmail: '',
  motherPhone: ''
};

const initialFiles = {
  passportPhoto: null,
  birthCertificate: null,
  medicalCertificate: null,
  previousSchoolRecords: null
};

const Admissions = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState(initialFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (name, file) => {
    setFiles({
      ...files,
      [name]: file
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
    Object.entries(files).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/public/apply`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(
          `${result.message} Your application number is ${result.data?.applicationNumber}.`
        );
        setFormData(initialFormData);
        setFiles(initialFiles);
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

  const requirements = [
    'Completed application form',
    'Birth certificate',
    'Previous school records (if applicable)',
    'Passport photographs',
    'Medical certificate'
  ];

  const steps = [
    'Submit online application',
    'Schedule entrance assessment',
    'Attend parent interview',
    'Receive admission decision',
    'Complete enrollment'
  ];

  return (
    <div className="admissions">
      <SEO
        title="Admissions"
        description="Start your child's application to GMA School — requirements, process, and online application form."
      />
      <PageHeader
        title="Admissions"
        description="Join the GMA School family and give your child the best educational foundation."
      />

      <section className="section">
        <div className="container">
          <div className="admissions-grid">
            <div className="admissions-info">
              <div className="admissions-info-block">
                <h3>
                  <SVGIcon name="checkCircle" size={22} />
                  Admission Requirements
                </h3>
                <ul className="admissions-checklist">
                  {requirements.map((item) => (
                    <li key={item}>
                      <SVGIcon name="check" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="admissions-info-block">
                <h3>
                  <SVGIcon name="arrowRight" size={22} />
                  Application Process
                </h3>
                <ol className="admissions-steps">
                  {steps.map((step, index) => (
                    <li key={step}>
                      <span className="admissions-step-number">{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="card admissions-form-card">
              <div className="card-header">
                <h3>Application Form</h3>
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
                  <h4 className="admissions-form-section-title">Student Information</h4>

                  <div className="admissions-form-row">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="admissions-form-row">
                    <div className="form-group">
                      <label className="form-label">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Division *</label>
                    <select
                      name="divisionApplied"
                      value={formData.divisionApplied}
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

                  <div className="admissions-form-row">
                    <div className="form-group">
                      <label className="form-label">Class/Grade *</label>
                      <input
                        type="text"
                        name="classApplied"
                        value={formData.classApplied}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g., Nursery 1, Grade 5, JSS 2"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Session *</label>
                      <input
                        type="text"
                        name="sessionApplied"
                        value={formData.sessionApplied}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g., 2025/2026"
                        required
                      />
                    </div>
                  </div>

                  <h4 className="admissions-form-section-title">Father's Information</h4>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="admissions-form-row">
                    <div className="form-group">
                      <label className="form-label">Email (optional)</label>
                      <input
                        type="email"
                        name="fatherEmail"
                        value={formData.fatherEmail}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <h4 className="admissions-form-section-title">Mother's Information</h4>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="admissions-form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="motherEmail"
                        value={formData.motherEmail}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="motherPhone"
                        value={formData.motherPhone}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <h4 className="admissions-form-section-title">Required Documents</h4>
                  <p className="admissions-form-hint">JPG, PNG, or PDF, up to 5MB each.</p>

                  <FileUploadField
                    label="Passport Photograph"
                    name="passportPhoto"
                    accept="image/*"
                    required
                    file={files.passportPhoto}
                    onChange={(file) => handleFileSelect('passportPhoto', file)}
                  />

                  <FileUploadField
                    label="Birth Certificate"
                    name="birthCertificate"
                    accept="image/*,.pdf"
                    required
                    file={files.birthCertificate}
                    onChange={(file) => handleFileSelect('birthCertificate', file)}
                  />

                  <FileUploadField
                    label="Medical Certificate"
                    name="medicalCertificate"
                    accept="image/*,.pdf"
                    required
                    file={files.medicalCertificate}
                    onChange={(file) => handleFileSelect('medicalCertificate', file)}
                  />

                  <FileUploadField
                    label="Previous School Records"
                    name="previousSchoolRecords"
                    accept="image/*,.pdf"
                    hint="If applicable"
                    file={files.previousSchoolRecords}
                    onChange={(file) => handleFileSelect('previousSchoolRecords', file)}
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

export default Admissions;