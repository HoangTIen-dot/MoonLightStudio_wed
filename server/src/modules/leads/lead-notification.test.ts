import { describe, expect, it, vi } from 'vitest';
import { sendLeadNotification, type LeadNotificationConfig, type MailSender } from './lead-notification.js';

const completeConfig: LeadNotificationConfig = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: 'studio@example.com',
  SMTP_APP_PASSWORD: 'app-password',
  LEAD_NOTIFICATION_TO: 'team@example.com',
  LEAD_NOTIFICATION_FROM: 'MoonLight Studio <studio@example.com>',
};

const lead = {
  name: 'New Client',
  company: 'Brand Co',
  email: 'client@example.com',
  phone: '+84 123',
  message: 'We need a CGI launch film.',
  status: 'new',
  createdAt: new Date('2026-07-15T00:00:00.000Z'),
};

describe('sendLeadNotification', () => {
  it('skips sending when SMTP config is incomplete', async () => {
    const mailSender: MailSender = {
      sendMail: vi.fn(),
    };

    const result = await sendLeadNotification(lead, {
      config: {
        ...completeConfig,
        SMTP_APP_PASSWORD: undefined,
      },
      mailSender,
    });

    expect(result).toEqual({ status: 'skipped', reason: 'SMTP is not fully configured' });
    expect(mailSender.sendMail).not.toHaveBeenCalled();
  });

  it('sends a lead notification email when SMTP config is complete', async () => {
    const mailSender: MailSender = {
      sendMail: vi.fn().mockResolvedValue(undefined),
    };

    const result = await sendLeadNotification(lead, {
      config: completeConfig,
      mailSender,
    });

    expect(result).toEqual({ status: 'sent' });
    expect(mailSender.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: completeConfig.LEAD_NOTIFICATION_FROM,
        to: completeConfig.LEAD_NOTIFICATION_TO,
        subject: 'New MoonLight Studio lead: New Client',
      }),
    );
  });

  it('reports failed delivery without throwing', async () => {
    const mailSender: MailSender = {
      sendMail: vi.fn().mockRejectedValue(new Error('SMTP failed')),
    };

    const result = await sendLeadNotification(lead, {
      config: completeConfig,
      mailSender,
    });

    expect(result).toEqual({ status: 'failed', reason: 'SMTP failed' });
  });
});
