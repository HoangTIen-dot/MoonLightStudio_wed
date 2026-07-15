import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

export type LeadNotificationConfig = {
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_APP_PASSWORD?: string;
  LEAD_NOTIFICATION_TO?: string;
  LEAD_NOTIFICATION_FROM?: string;
};

export type LeadNotificationPayload = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  message: string;
  status: string;
  createdAt?: Date;
};

export type LeadNotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

export type MailSender = {
  sendMail(options: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
};

type SendLeadNotificationOptions = {
  config?: LeadNotificationConfig;
  mailSender?: MailSender;
};

function getLeadNotificationConfig(): LeadNotificationConfig {
  return {
    SMTP_HOST: env.SMTP_HOST,
    SMTP_PORT: env.SMTP_PORT,
    SMTP_SECURE: env.SMTP_SECURE,
    SMTP_USER: env.SMTP_USER,
    SMTP_APP_PASSWORD: env.SMTP_APP_PASSWORD,
    LEAD_NOTIFICATION_TO: env.LEAD_NOTIFICATION_TO,
    LEAD_NOTIFICATION_FROM: env.LEAD_NOTIFICATION_FROM,
  };
}

function isCompleteConfig(config: LeadNotificationConfig) {
  return Boolean(
    config.SMTP_HOST &&
      config.SMTP_PORT &&
      typeof config.SMTP_SECURE === 'boolean' &&
      config.SMTP_USER &&
      config.SMTP_APP_PASSWORD &&
      config.LEAD_NOTIFICATION_TO &&
      config.LEAD_NOTIFICATION_FROM,
  );
}

function createMailSender(config: Required<LeadNotificationConfig>): MailSender {
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_APP_PASSWORD,
    },
  });
}

function buildLeadNotificationText(lead: LeadNotificationPayload) {
  const createdAt = lead.createdAt ? lead.createdAt.toISOString() : new Date().toISOString();

  return [
    'A new lead was submitted on the MoonLight Studio website.',
    '',
    `Name: ${lead.name}`,
    `Company: ${lead.company || '-'}`,
    `Email: ${lead.email || '-'}`,
    `Phone: ${lead.phone || '-'}`,
    `Status: ${lead.status}`,
    `Created: ${createdAt}`,
    '',
    'Message:',
    lead.message,
  ].join('\n');
}

export async function sendLeadNotification(
  lead: LeadNotificationPayload,
  options: SendLeadNotificationOptions = {},
): Promise<LeadNotificationResult> {
  const config = options.config ?? getLeadNotificationConfig();

  if (!isCompleteConfig(config)) {
    return { status: 'skipped', reason: 'SMTP is not fully configured' };
  }

  const completeConfig = config as Required<LeadNotificationConfig>;
  const mailSender = options.mailSender ?? createMailSender(completeConfig);

  try {
    await mailSender.sendMail({
      from: completeConfig.LEAD_NOTIFICATION_FROM,
      to: completeConfig.LEAD_NOTIFICATION_TO,
      subject: `New MoonLight Studio lead: ${lead.name}`,
      text: buildLeadNotificationText(lead),
    });

    return { status: 'sent' };
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown email delivery error',
    };
  }
}
