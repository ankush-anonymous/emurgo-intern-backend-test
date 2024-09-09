import Fastify from 'fastify';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { jwtPlugin, jwtAuth } from './plugins/jwtPlugin';  // Use custom plugin
import bootstrap from './db/init';

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


try {
  await bootstrap();
  await fastify.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
