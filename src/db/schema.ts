import {
  timestamp,
  index,
  json,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

export const consentsTable = pgTable(
  'consents',
  {
    id: serial().primaryKey(),
    services: json(),
    config: json(),
    domain: varchar({ length: 255 }).notNull(),
    user_id: varchar({ length: 255 }).notNull(),
    user_agent: varchar({ length: 255 }).notNull(),
    user_ip: varchar({ length: 45 }).notNull(),
    consent_logged_at: timestamp().defaultNow().notNull(),
  },
  (table) => {
    return [
      index('user_id_idx').on(table.user_id),
      index('domain_idx').on(table.domain),
    ];
  }
);
