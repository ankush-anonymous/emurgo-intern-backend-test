import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from 'fastify';
import fastifyJWT from '@fastify/jwt';

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const jwtPlugin = fastifyPlugin(async (fastify, options) => {
  await fastify.register(fastifyJWT, {
    secret: JWT_SECRET
  });
});


// Decorate Fastify instance with jwtAuth method
const jwtAuth = async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify(); // Verify the JWT token
    console.log('Decoded JWT:', request.user); // Log to ensure the JWT is properly decoded
  } catch (error) {
    reply.status(401).send({
      message: 'Unauthorized',
    });
  }
};


// Export jwtPlugin and jwtAuth
export { jwtPlugin, jwtAuth };
