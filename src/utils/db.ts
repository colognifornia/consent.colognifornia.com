import db from '@/db';
import pino from './pino';
import { consentsTable } from '@/db/schema';

export async function checkDBConnection() {
  try {
    await db.select().from(consentsTable);
    pino.info('Connected to the database');
    return true;
  } catch (error) {
    pino.error('Failed to connect to the database');
    pino.error(error);
  }
  return false;
}
