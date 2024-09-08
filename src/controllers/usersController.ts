import { StatusCodes } from 'http-status-codes';
import * as userRepository from '../repository/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Ensure this is set in .env
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // Default to '1h' if not set


//to check if userName exists and create new user
export const createUser = async (request, reply) => {
  try {
    const { userName, password } = request.body;

    // Validate input
    if (!userName || !password) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'Username and password are required',
      });
    }

    // Check if a user with the same username already exists
    const existingUser = await userRepository.getUserByUserName(userName);
    if (existingUser) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'Username already taken',
      });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call to the user repository to create a user
    const result = await userRepository.createUser(userName, hashedPassword);

    reply.status(StatusCodes.CREATED).send({
      message: 'User created successfully',
      result
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error creating user',
      error: error.message,
    });
  }
};




//to get All Users
export const getUserById = async (request, reply) => {
  try {
    const { userId } = request.params;

    // Validate input
    if (!userId) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'User ID is required',
      });
    }

    // Call the repository method to get user by ID
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return reply.status(StatusCodes.NOT_FOUND).send({
        message: 'User not found',
      });
    }

    reply.status(StatusCodes.OK).send({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

//to get All Users
export const getAllUsers = async (request, reply) => {
  try {
    // Call the repository method to get all users
    const users = await userRepository.getAllUsers();

    reply.status(StatusCodes.OK).send({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error fetching users',
      error: error.message,
    });
  }
};



//to authenticate user
export const authenticateUser = async (request, reply) => {
  try {
    const { userName, password } = request.body;

    // Validate input
    if (!userName || !password) {
      return reply.status(StatusCodes.BAD_REQUEST).send({
        message: 'Username and password are required',
      });
    }

    // Get user by username
    const user = await userRepository.getUserByUserName(userName);
    
    if (!user) {
      return reply.status(StatusCodes.UNAUTHORIZED).send({
        message: 'Authentication failed: User not found',
      });
    }

    // Compare password with hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return reply.status(StatusCodes.UNAUTHORIZED).send({
        message: 'Authentication failed: Incorrect password',
      });
    }

    // Generate JWT token using jsonwebtoken
    const token = jwt.sign(
      { userId: user.id, username: user.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: JWT_EXPIRATION } // Token expiration
    );

    reply.status(StatusCodes.OK).send({
      message: 'Authentication successful',
      token
    });
  } catch (error: any) {
    console.error('Error during authentication:', error);
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: 'Error during authentication',
      error: error.message,
    });
  }
};




