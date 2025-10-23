const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME || "ggnRentalDeals"
    };

    const receivers = [{ email: to }];

    console.log(`📧 Sending email via Brevo API:
To: ${to}
Subject: ${subject}
---------------------`);

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      textContent: text,
      htmlContent: html
    });

    console.log(`✅ Email successfully sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email via Brevo API:", error.message);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
