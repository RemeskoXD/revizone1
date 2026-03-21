import nodemailer from 'nodemailer';

export type SendMailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
};

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!smtpConfigured()) return null;
  if (transporter) return transporter;

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure =
    process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Pro některé servery (např. vlastní VPS) může být potřeba:
    // tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false' },
  });

  return transporter;
}

/**
 * Odešle e-mail přes SMTP, pokud jsou nastavené proměnné SMTP_*.
 * Pokud SMTP není nastavené, nic neposílá a vrátí { sent: false, reason: 'not_configured' }.
 */
export async function sendMail(
  options: SendMailOptions
): Promise<{ sent: boolean; reason?: string; messageId?: string }> {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[mail] SMTP není nastavené – e-mail se neodeslal:',
        options.subject,
        '→',
        options.to
      );
    }
    return { sent: false, reason: 'not_configured' };
  }

  const from = process.env.SMTP_FROM as string;

  const info = await transport.sendMail({
    from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo,
  });

  return { sent: true, messageId: info.messageId };
}

export function isSmtpEnabled(): boolean {
  return smtpConfigured();
}
