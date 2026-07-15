import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared sandbox sender — works without verifying a custom domain,
// but can only deliver to the email address your Resend account is
// registered with until you verify your own domain at resend.com/domains.
const FROM_ADDRESS = 'GMA School <onboarding@resend.dev>';

// Where new contact/admission/career submissions get reported. This is also
// the one address that can actually receive mail while the account is in
// Resend sandbox mode.
const SCHOOL_EMAIL = 'sunmolagoodness06@gmail.com';

const wrapper = (bodyHtml) => `
  <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
    <div style="background: #0A1F44; padding: 24px; text-align: center;">
      <span style="color: #C9A84C; font-size: 20px; font-weight: bold; letter-spacing: 1px;">GMA SCHOOL</span>
    </div>
    <div style="padding: 24px; color: #1A1A1A; line-height: 1.6;">
      ${bodyHtml}
    </div>
    <div style="padding: 16px 24px; color: #6B6B6B; font-size: 12px; border-top: 1px solid #E5E7EB;">
      Goodness and Mercy Academy
    </div>
  </div>
`;

const send = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html: wrapper(html) });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

export const sendContactConfirmation = async ({ name, email }) => {
  await send({
    to: email,
    subject: 'We received your message — GMA School',
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for reaching out to Goodness and Mercy Academy. We've received your message and will get back to you soon.</p>
      <p>— GMA School</p>
    `
  });
};

export const sendAdmissionConfirmation = async ({ parentEmail, studentName, applicationNumber }) => {
  await send({
    to: parentEmail,
    subject: `Application Received — ${applicationNumber}`,
    html: `
      <p>Dear Parent/Guardian,</p>
      <p>We've received ${studentName}'s application to GMA School. Your application number is
        <strong>${applicationNumber}</strong> — please keep this for your records.</p>
      <p>Our admissions team will review the application and contact you soon.</p>
      <p>— GMA School</p>
    `
  });
};

export const sendCareerConfirmation = async ({ email, fullName, position }) => {
  await send({
    to: email,
    subject: 'Application Received — GMA School Careers',
    html: `
      <p>Dear ${fullName},</p>
      <p>Thank you for applying for the ${position} position at GMA School. We've received your
        application and will review it shortly.</p>
      <p>— GMA School HR Team</p>
    `
  });
};

export const notifySchoolOfContact = async ({ name, email, phone, subject, message }) => {
  await send({
    to: SCHOOL_EMAIL,
    subject: `New contact message: ${subject || 'General enquiry'}`,
    html: `
      <p>New message submitted through the website contact form.</p>
      <p><strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Phone:</strong> ${phone}<br>
        <strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `
  });
};

export const notifySchoolOfAdmission = async ({ studentName, applicationNumber, divisionApplied, fatherName, fatherEmail, fatherPhone }) => {
  await send({
    to: SCHOOL_EMAIL,
    subject: `New admission application — ${applicationNumber}`,
    html: `
      <p>A new admission application was submitted through the website.</p>
      <p><strong>Application #:</strong> ${applicationNumber}<br>
        <strong>Student:</strong> ${studentName}<br>
        <strong>Division applied for:</strong> ${divisionApplied}<br>
        <strong>Father's name:</strong> ${fatherName}<br>
        <strong>Father's email:</strong> ${fatherEmail || 'Not provided'}<br>
        <strong>Father's phone:</strong> ${fatherPhone}</p>
      <p>Review it in the admin portal.</p>
    `
  });
};

export const notifySchoolOfCareerApplication = async ({ fullName, email, phone, position, experience }) => {
  await send({
    to: SCHOOL_EMAIL,
    subject: `New job application — ${position}`,
    html: `
      <p>A new job application was submitted through the website.</p>
      <p><strong>Name:</strong> ${fullName}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Phone:</strong> ${phone}<br>
        <strong>Position:</strong> ${position}<br>
        <strong>Experience:</strong> ${experience || 'N/A'}</p>
      <p>Review it in the admin portal.</p>
    `
  });
};

export const sendCredentialsEmail = async ({ email, identifier, password, studentName }) => {
  await send({
    to: email,
    subject: 'Your GMA School parent portal account is ready',
    html: `
      <p>Dear Parent/Guardian,</p>
      <p>${studentName}'s admission has been approved, and a parent portal account has been created for you.</p>
      <p><strong>Login:</strong> ${identifier}<br>
        <strong>Password:</strong> ${password}</p>
      <p>Please log in and change your password as soon as possible.</p>
      <p>— GMA School</p>
    `
  });
};

export const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  await send({
    to: email,
    subject: 'Reset your GMA School password',
    html: `
      <p>You requested a password reset for your GMA School portal account.</p>
      <p><a href="${resetUrl}" style="color: #0A1F44; font-weight: bold;">Click here to reset your password</a>.
        This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
    `
  });
};
