import env from '@/env';
import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle(env.DATABASE_URL);

export default db;
