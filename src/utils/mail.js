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

export async function sendPasswordResetEmail({ resetUrl }) {
  return sendMail({
    to: process.env.GSMTP_TO,
    subject: 'Recupera tu contraseña',
    html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.07);">
      <h2 style="color: #4a90e2; margin-top: 0;">Recupera tu contraseña</h2>
      <p>Haz clic en el siguiente botón para restablecer tu contraseña. El enlace expirará en 1 hora.</p>
      <a href="${resetUrl}" style="display:inline-block; background:#4a90e2; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; margin: 1em 0;">Restablecer contraseña</a>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
      <div style="text-align: center; color: #aaa; font-size: 0.9em;">Backend II &middot; Coderhouse</div>
    </div>`
  });
}

export async function sendAdminRequestEmail({ to, user, approveUrl, denyUrl }) {
  return sendMail({
    to,
    subject: 'Solicitud de rol de administrador',
    html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.07);">
      <h2 style="color: #d32f2f; margin-top: 0;">Solicitud de rol de administrador</h2>
      <p>El usuario <b>${user.name} ${user.last_name}</b> (<code>${user.email}</code>) ha solicitado el rol de administrador.</p>
      <p><b>ID de usuario:</b> ${user.id}</p>
      <div style="margin: 2em 0;">
        <a href="${approveUrl}" style="display:inline-block; background:#388e3c; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; margin-right: 1em;">ACEPTAR</a>
        <a href="${denyUrl}" style="display:inline-block; background:#d32f2f; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">DENEGAR</a>
      </div>
      <p>Estos enlaces expiran en 24 horas y solo pueden usarse una vez.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
      <div style="text-align: center; color: #aaa; font-size: 0.9em;">Backend II &middot; Coderhouse</div>
    </div>`
  });
}

export async function sendAdminApprovalEmail({ to, user }) {
  return sendMail({
    to,
    subject: '¡Tu solicitud de administrador fue aprobada!',
    html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #e8f5e9; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.07);">
      <h2 style="color: #388e3c; margin-top: 0;">¡Felicidades, ${user.name}!</h2>
      <p>Tu solicitud para obtener el rol de <b>administrador</b> ha sido <b>aprobada</b>.</p>
      <p>Ahora tienes acceso a privilegios elevados en la plataforma.</p>
      <div style="margin: 2em 0; text-align: center;"><span style="font-size:2em;">🛡️</span></div>
      <p style="color: #888; font-size: 0.95em;">Si no solicitaste este cambio, por favor contacta al soporte.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
      <div style="text-align: center; color: #aaa; font-size: 0.9em;">Backend II &middot; Coderhouse</div>
    </div>`
  });
}