import Fastify from 'fastify';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { jwtPlugin, jwtAuth } from './plugins/jwtPlugin';  // Use custom plugin

// Initialize Fastify instance
const fastify = Fastify({ logger: true });

// Register the JWT plugin using the custom plugin
fastify.register(jwtPlugin);

// Import user routes
import userRoutes from "./routes/usersRoutes";
import bookRoutes from "./routes/booksRoutes";

// Register routes
fastify.register(userRoutes, { prefix: "/api/v1" });
fastify.register(bookRoutes, { prefix: "/api/v1" });

// Sample root route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// PostgreSQL operations (unchanged)
async function testPostgres(pool: Pool) {
  const userId = randomUUID();
  const username = 'Satoshi';
  const password = 'Nakamoto';

  await pool.query(`
    INSERT INTO users (id, username, password)
    VALUES ($1, $2, $3);
  `, [userId, username, password]);

  const bookId = randomUUID();
  const bookName = 'Blockchain Revolution';

  await pool.query(`
    INSERT INTO books (id, bookName, userId)
    VALUES ($1, $2, $3);
  `, [bookId, bookName, userId]);

  const { rows: userRows } = await pool.query(`SELECT * FROM users;`);
  console.log('USERS:', userRows);

  const { rows: bookRows } = await pool.query(`SELECT * FROM books;`);
  console.log('BOOKS:', bookRows);
}

async function createTables(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bookName TEXT NOT NULL,
      userId UUID REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

async function bootstrap() {
  console.log('Bootstrapping...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({
    connectionString: databaseUrl
  });

  await createTables(pool);
  // await testPostgres(pool);
}

try {
  await bootstrap();
  await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
