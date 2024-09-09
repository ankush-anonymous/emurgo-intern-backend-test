import Fastify from 'fastify';
import { jwtPlugin } from '../plugins/jwtPlugin'; // Adjust import based on your structure
import userRoutes from '../routes/usersRoutes';
import bookRoutes from '../routes/booksRoutes';
import bootstrap from '../db/init';

const initializeFastify=async()=> {
  const fastify = Fastify({ logger: true });

  // Register plugins
  fastify.register(jwtPlugin);

  // Register routes
  fastify.register(userRoutes);
  fastify.register(bookRoutes);

  // Sample root route
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  // Initialize database and other resources
  await bootstrap();

  return fastify;
}

export default initializeFastify;