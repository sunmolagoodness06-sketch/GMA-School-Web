// Termii (https://termii.com) — SMS delivery for Nigerian phone numbers.
// TERMII_SENDER_ID must be a sender ID registered/approved in your Termii
// dashboard before real messages will deliver; until then sends will fail
// and are caught + logged rather than breaking the calling request.
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'GMASchool';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api/sms/send';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const sendSMS = async ({ to, message }) => {
  if (!TERMII_API_KEY) {
    console.error(`SMS not sent to ${to}: TERMII_API_KEY is not configured`);
    return;
  }

  try {
    const response = await fetch(TERMII_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic'
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to send SMS to ${to}:`, result);
    }
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
  }
};

export const sendCredentialsSMS = async ({ phone, identifier, password, role }) => {
  await sendSMS({
    to: phone,
    message: `Welcome to GMA School! Your ${role} portal account is ready.\nLogin: ${identifier}\nPassword: ${password}\n${FRONTEND_URL}/login\nPlease change your password after logging in.`
  });
};

export const sendPasswordResetSMS = async ({ phone, resetUrl }) => {
  await sendSMS({
    to: phone,
    message: `GMA School password reset requested. Tap to reset (expires in 1 hour): ${resetUrl}\nIf you didn't request this, ignore this message.`
  });
};

export const sendAdmissionConfirmationSMS = async ({ phone, studentName, applicationNumber }) => {
  await sendSMS({
    to: phone,
    message: `GMA School: We've received ${studentName}'s application. Your application number is ${applicationNumber} — keep this for your records. We'll contact you soon.`
  });
};

const DECISION_LABELS_SMS = { admitted: 'admitted', rejected: 'not admitted', waitlisted: 'waitlisted' };

export const sendAdmissionDecisionSMS = async ({ phone, studentName, applicationNumber, decision }) => {
  await sendSMS({
    to: phone,
    message: `GMA School: ${studentName}'s application (${applicationNumber}) has been ${DECISION_LABELS_SMS[decision] || decision}. Check your email or contact the school for details.`
  });
};
