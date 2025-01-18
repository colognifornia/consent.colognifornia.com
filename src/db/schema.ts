import { sql } from 'drizzle-orm';
import {
  datetime,
  index,
  json,
  mysqlTable,
  serial,
  varchar,
} from 'drizzle-orm/mysql-core';

export const consentsTable = mysqlTable(
  'consents',
  {
    id: serial().primaryKey(),
    services: json(),
    config: json(),
    domain: varchar({ length: 255 }).notNull(),
    user_id: varchar({ length: 255 }).notNull(),
    user_agent: varchar({ length: 255 }).notNull(),
    user_ip: varchar({ length: 45 }).notNull(),
    consent_logged_at: datetime()
      .default(sql`now()`)
      .notNull(),
  },
  (table) => {
    return {
      user_id_idx: index('user_id_idx').on(table.user_id),
      domain_idx: index('domain_idx').on(table.domain),
    };
  }
);
