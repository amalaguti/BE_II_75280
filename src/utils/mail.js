import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GSMTP_FROM,
        pass: process.env.GSMTP
      }
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, attachments }) {
  try {
    const mailOptions = {
      from: process.env.GSMTP_FROM,
      to,
      subject,
      html,
      attachments
    };
    const info = await getTransporter().sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    return null;
  }
}

export async function sendWelcomeEmail({ first_name, last_name }) {
  return sendMail({
    to: process.env.GSMTP_TO,
    subject: '¡Bienvenido a Backend II!',
    html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.07);">
      <h2 style="color: #4a90e2; margin-top: 0;">¡Bienvenido, ${first_name}!</h2>
      <p style="font-size: 1.1rem; color: #333;">Gracias por registrarte en <b>Backend II</b>.</p>
      <p style="color: #444;">Tu cuenta ha sido creada exitosamente. ¡Esperamos que disfrutes la experiencia!</p>
      <p style="color: #444; margin: 0.5em 0 0.5em 0;"><b>Usuario:</b> ${first_name} ${last_name}</p>
      <p style="margin-top: 2em; color: #888; font-size: 0.95em;">Este es un correo de bienvenida automático.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
      <div style="text-align: center; color: #aaa; font-size: 0.9em;">Backend II &middot; Coderhouse</div>
    </div>`
  });
}