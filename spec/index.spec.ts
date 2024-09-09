import { describe, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';
import initializeFastify  from '../src/utils/initialiseFastify'; // Correct path
import userTesting from './userTesting.spec'; // Import the test cases
import Fastify, { type FastifyInstance } from 'fastify';
import userRoutes from "../src/routes/usersRoutes"

let app: FastifyInstance;

beforeAll(async () => {
  config(); // Load environment variables
  app = await initializeFastify(); // Create a new Fastify instance
  // app.register(userRoutes); // Register the user routes
  await app.ready(); // Ensure the app is ready before tests run
});



describe('API layer testing', () => {
  userTesting(app); // Run the user-specific tests
});
