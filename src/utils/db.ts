import db from '@/db';
import pino from './pino';

export async function checkDBConnection() {
  try {
    await db.execute('select 1');
    pino.info('Connected to the database');
    return true;
  } catch (error) {
    pino.error('Failed to connect to the database');
    pino.error(error);
  }
  return false;
}
