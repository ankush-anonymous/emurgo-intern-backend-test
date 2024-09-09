import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { faker } from '@faker-js/faker';

let app: FastifyInstance;
let authToken: string;
let createdBookId: string;
const randomUserId = faker.datatype.uuid();
const randomBookName = faker.lorem.words(2); // Generates a random book name

// Helper functions to manage tokens and IDs
const generateAuthToken = async (app: FastifyInstance) => {
  const response = await app.inject({
    method: 'POST',
    url: '/users/authenticate',
    payload: {
      username: 'testuser',
      password: 'testpassword',
    },
  });
  const result = JSON.parse(response.payload);
  return result.token;
};

const setAuthToken = async () => {
  authToken = await generateAuthToken(app);
};

const setCreatedBookId = (id: string) => {
  createdBookId = id;
};

export async function runBookTests(app: FastifyInstance) {
  beforeAll(async () => {
    await setAuthToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Book API', () => {

    // Test book creation
    describe('POST /books', () => {
      it('should create a new book with valid data', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/books',
          headers: {
            Authorization: `Bearer ${authToken}`,  // Use the generated token
          },
          payload: {
            bookName: randomBookName,
          },
        });

        expect(response.statusCode).toBe(201);
        const book = JSON.parse(response.payload);
        expect(book).toHaveProperty('result');
        expect(book.result.bookName).toBe(randomBookName);
        setCreatedBookId(book.result.id);  // Save the created book ID for future tests
      });

      it('should return 400 if bookName is missing or invalid', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/books',
          headers: {
            Authorization: `Bearer ${authToken}`,  // Use the generated token
          },
          payload: {},
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'Book name is required and must be a string');
      });
    });

    // Test fetching all books
    describe('GET /books', () => {
      it('should retrieve all books', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/books',
        });

        expect(response.statusCode).toBe(200);
        const result = JSON.parse(response.payload);
        expect(result).toHaveProperty('books');
      });
    });

    // Test fetching a book by ID
    describe('GET /books/:bookId', () => {
      it('should retrieve a book by ID', async () => {
        if (!createdBookId) {
          throw new Error('Created book ID not set');
        }

        const response = await app.inject({
          method: 'GET',
          url: `/books/${createdBookId}`,  // Use the created book ID
        });

        expect(response.statusCode).toBe(200);
        const book = JSON.parse(response.payload);
        expect(book).toHaveProperty('book');
        expect(book.book.id).toBe(createdBookId);
      });

      it('should return 404 for a non-existent book', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/books/nonexistentbookid',
        });

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'Book not found');
      });
    });

    // Test attaching a book to a user
    describe('POST /users/:userId/books/:bookId', () => {
      it('should attach a book to a user with valid data', async () => {
        if (!createdBookId) {
          throw new Error('Created book ID not set');
        }

        const response = await app.inject({
          method: 'POST',
          url: `/users/${randomUserId}/books/${createdBookId}`,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Use the generated token
          },
        });

        expect(response.statusCode).toBe(200);
        const result = JSON.parse(response.payload);
        expect(result).toHaveProperty('updatedBook');
        expect(result.updatedBook.userId).toBe(randomUserId);
        expect(result.updatedBook.bookId).toBe(createdBookId);
      });

      it('should return 400 if userId or bookId is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/users/${randomUserId}/books/`,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Use the generated token
          },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'User ID and Book ID are required');
      });

      it('should return 403 if attempting to attach book to another user', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/users/${randomUserId}/books/${createdBookId}`,
          headers: {
            Authorization: `Bearer ${authToken}`,  // Use a token for a different user
          },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.payload)).toHaveProperty('message', 'You are not authorized to attach a book to another user');
      });
    });
  });
}
