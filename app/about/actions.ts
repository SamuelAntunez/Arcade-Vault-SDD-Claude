"use server";

import { Resend } from "resend";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  sentName?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Completa todos los campos." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Revisa el formato del correo." };
  }

  const toEmail = process.env.RESEND_TO_EMAIL;
  if (!process.env.RESEND_API_KEY || !toEmail) {
    return {
      status: "error",
      message: "El envío de correo no está configurado. Intenta más tarde.",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Arcade Vault <onboarding@resend.dev>",
    to: toEmail,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${name}`,
    text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`,
  });

  if (error) {
    return {
      status: "error",
      message: "No se pudo enviar el mensaje. Intenta de nuevo.",
    };
  }

  return { status: "success", sentName: name };
}
