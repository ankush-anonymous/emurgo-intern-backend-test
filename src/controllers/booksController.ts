import { StatusCodes } from 'http-status-codes';
import * as bookRepository from '../repository/bookRepository';
import * as userRepository from '../repository/userRepository';


//to create book
export const createBook = async (request, reply) => {
  try {
    const { bookName } = request.body;

    // Check if bookName is provided
    if (!bookName || typeof bookName !== 'string') {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'Book name is required and must be a string',
      });
    }

    // Call the book repository to create a book
    const result = await bookRepository.createBook(bookName);

    reply.status(StatusCodes.CREATED).send({
      message: 'Book created successfully',
      result,
    });
  } catch (error: any) {
    console.error('Error creating book:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error creating book',
      error: error.message,
    });
  }
};



export const attachBookToUser = async (request, reply) => {
  try {
    const { userId: userIdFromParams, bookId } = request.params;
    const authenticatedUserId = request.user.userId; // Extract userId from JWT (already decoded)

    // Validate input
    if (!userIdFromParams || !bookId) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'User ID and Book ID are required',
      });
    }

    // Ensure both IDs are treated as strings
    if (String(authenticatedUserId) !== String(userIdFromParams)) {
      return reply.status(StatusCodes.FORBIDDEN).send({
        message: 'You are not authorized to attach a book to another user',
      });
    }

    // Check if the user exists
    const user = await userRepository.getUserById(userIdFromParams);
    if (!user) {
      return reply.status(StatusCodes.NOT_FOUND).send({
        message: 'User not found',
      });
    }

    // Check if the book exists
    const book = await bookRepository.getBookById(bookId);
    if (!book) {
      return reply.status(StatusCodes.NOT_FOUND).send({
        message: 'Book not found',
      });
    }

    // Attach the book to the user
    const updatedBook = await bookRepository.attachBookToUser(userIdFromParams, bookId);

    reply.status(StatusCodes.OK).send({
      message: 'Book successfully attached to the user',
      updatedBook,
    });
  } catch (error: any) {
    console.error('Error attaching book to user:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error attaching book to user',
      error: error.message,
    });
  }
};




export const getAllBooks = async (request, reply) => {
  try {
    // Call the book repository to get all books
    const books = await bookRepository.getAllBooks();

    reply.status(StatusCodes.OK).send({
      message: 'Books retrieved successfully',
      books,
    });
  } catch (error: any) {
    console.error('Error retrieving books:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error retrieving books',
      error: error.message,
    });
  }
};





export const getBookById = async (request, reply) => {
  try {
    const { bookId } = request.params;

    // Validate input
    if (!bookId) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'Book ID is required',
      });
    }

    // Call the book repository to get the book by ID
    const book = await bookRepository.getBookById(bookId);

    if (!book) {
      return reply.status(StatusCodes.NOT_FOUND).send({
        message: 'Book not found',
      });
    }

    reply.status(StatusCodes.OK).send({
      message: 'Book retrieved successfully',
      book,
    });
  } catch (error: any) {
    console.error('Error retrieving book:', error);
    if (error.message === 'Book not found') {
      reply.status(StatusCodes.NOT_FOUND).send({
        message: 'Book not found',
      });
    } else {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: 'Error retrieving book',
        error: error.message,
      });
    }
  }
};








