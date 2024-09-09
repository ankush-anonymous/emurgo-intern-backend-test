import initializeFastify from '../src/utils/initialiseFastify';

const startServer = async () => {
  try {
    // Initialize Fastify instance with plugins, routes, and database
    const fastify = await initializeFastify();

    // Start the server
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:3000`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1); // Exit the process if there is an error
  }
};

startServer();
