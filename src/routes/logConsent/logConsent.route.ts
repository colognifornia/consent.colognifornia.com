import { createApp } from '@/app';
import db from '@/db';
import { consentsTable } from '@/db/schema';
import pino from '@/utils/pino';
import { zValidator } from '@hono/zod-validator';
import { getCookie, setCookie } from 'hono/cookie';
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes';
import { z } from 'zod';
import { isV4Format, mask as maskIP } from 'neoip';
import { NeonHttpQueryResult } from 'drizzle-orm/neon-http';

const app = createApp();

const domainEnum = z.enum(['colognifornia.test', 'colognifornia.com']);

const logConsentJSONBodySchema = z.object({
  services: z.object({
    matomo: z.boolean(),
  }),
  domain: domainEnum,
  // ensures config is present without any validation of its content
  config: z.object({}).catchall(z.any()),
  user_id: z.string().optional(),
});

export type LogConsentJSONBody = z.infer<typeof logConsentJSONBodySchema>;

type InsertConsent = typeof consentsTable.$inferInsert & {
  services: LogConsentJSONBody['services'];
  domain: LogConsentJSONBody['domain'];
  config: LogConsentJSONBody['config'];
};

app.post(
  '/logConsent',
  zValidator('json', logConsentJSONBodySchema),
  async (c) => {
    const body = c.req.valid('json');

    // validate that request is (hopefully) coming from specified domain
    if (
      c.req.header('Origin') !== 'https://' + body.domain ||
      !c.req.header('Referer')?.startsWith('https://' + body.domain)
    ) {
      return c.json({ error: 'Invalid domain.', success: false }, BAD_REQUEST);
    }

    // get user_id from cookie if present
    let user_id = getCookie(c, 'consent_user_id') ?? body.user_id;
    const parsedUserId = z.string().uuid().safeParse(user_id);
    if (!parsedUserId.success) {
      pino.warn('Invalid consent_user_id cookie: ', user_id);
      user_id = undefined;
    } else {
      user_id = parsedUserId.data;
    }

    // validate user IP
    let user_ip = c.env.incoming.socket.remoteAddress;
    const parsedIP = z.string().ip().safeParse(user_ip);
    if (!parsedIP.success) {
      pino.warn('Invalid user IP address: ', user_ip);
      user_ip = undefined;
    } else {
      // anonymize IP address
      user_ip = isV4Format(parsedIP.data)
        ? maskIP(parsedIP.data, '255.255.0.0')
        : maskIP(parsedIP.data, 'ffff:ffff:ffff:0000:0000:0000:0000:0000');
    }

    const consent: InsertConsent = {
      ...body,
      user_id: user_id ?? crypto.randomUUID(),
      user_ip: user_ip ?? 'unknown',
      user_agent: c.req.header('User-Agent') ?? 'unknown',
    };

    // insert consent into db
    try {
      const res: NeonHttpQueryResult<InsertConsent> = await db
        .insert(consentsTable)
        .values(consent);
      if (res.rowCount !== 1) {
        throw new Error('DB insert failed, no affected rows.');
      }
    } catch (e) {
      pino.error(e);
      return c.json(
        { error: 'Failed to log consent.', success: false },
        INTERNAL_SERVER_ERROR
      );
    }

    // set consent_user_id cookie
    setCookie(c, 'consent_user_id', consent.user_id, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      domain: '26bb-2001-9e8-d0aa-e00-8539-63e7-e6f3-3587.ngrok-free.app',
      partitioned: true,
    });

    return c.json(consent, CREATED);
  }
);

export default app;
