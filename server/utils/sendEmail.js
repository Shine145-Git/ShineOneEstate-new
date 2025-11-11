const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const sendEmail = async ({ to, subject, text, html, templateId, params }) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME || "www.ggnHome.com"
    };

    // normalize receivers to the SDK expected shape (array of { email, name? })
    const receivers = Array.isArray(to)
      ? to.map(t => (typeof t === 'string' ? { email: t } : t))
      : [{ email: to }];

    // If templateId is not passed in function args, try env var fallback
    if (!templateId && process.env.BREVO_OTP_TEMPLATE_ID) {
      templateId = Number(process.env.BREVO_OTP_TEMPLATE_ID);
    }

    

    if (templateId) {
      // send using a Brevo template and template parameters
      await tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        templateId: Number(templateId),
        params: params
      });
      // console.log(`✅ Email (template ${templateId}) successfully sent to ${to}`);
    } else {
      // fallback: send raw subject/html/text
      await tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject,
        textContent: text,
        htmlContent: html
      });
      console.log(`✅ Email successfully sent to ${to}`);
    }
  } catch (error) {
    console.error("❌ Error sending email via Brevo API:", error.message);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
