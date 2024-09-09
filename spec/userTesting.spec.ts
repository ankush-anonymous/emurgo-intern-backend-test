import { describe, it, expect } from 'vitest';
import { type FastifyInstance } from 'fastify';

const generateUserName = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function runUserTests(app: FastifyInstance) {
  describe('User API', () => {
    
    // Test user creation
    describe('POST /users', () => {
      it('should create a new user with valid data', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/users',
          payload: {
            userName: generateUserName,
            password: "userPassword",
          },
        });

        expect(response.statusCode).toBe(201);
        const user = JSON.parse(response.payload);
        expect(user).toHaveProperty('result');
        
      });

      it('should return 400 if username already exists', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/users',
          payload: {
            userName: generateUserName,  // Same username as previous test
            password: 'anotherpassword',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'Username already taken');
      });

      it('should return 400 if username is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/users',
          payload: {
            password: "passwordUnique",
          },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'Username and password are required');
      });
    });

    // Test user authentication
    describe('POST /users/authenticate', () => {
      it('should authenticate a user with correct credentials', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/users/authenticate',
          payload: {
            userName: generateUserName,
            password: "uniquePassword",
          },
        });

        expect(response.statusCode).toBe(200);
        const result = JSON.parse(response.payload);
        expect(result).toHaveProperty('token');
      });

      it('should return 401 with incorrect password', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/users/authenticate',
          payload: {
            userName: generateUserName,
            password: 'wrongpassword',
          },
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'Authentication failed: Incorrect password');
      });
    });

  

    // Test fetching all users (JWT protected)
    describe('GET /users', () => {
      it('should retrieve all users with valid JWT', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/users',
          headers: {
            Authorization: `Bearer ewetdtssgvyyhuyudbuuhf@5yhhgy`,  
          },
        });

        expect(response.statusCode).toBe(200);
        const result = JSON.parse(response.payload);
        expect(result).toHaveProperty('users');
      });

      it('should return 401 without a JWT token', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/users',
        });

        expect(response.statusCode).toBe(401);
      });
    });
  });
}
