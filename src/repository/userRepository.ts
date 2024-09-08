import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: databaseUrl
});

//to create user
export const createUser = async (
  userName: string, 
  password: string
): Promise<{ id: string, username: string, password: string }> => {
  try {
    // Insert the new user and return the newly inserted row
    const result = await pool.query(`
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username, password;
    `, [userName, password]);

    // Extract the user data from the result
    const newUser = result.rows[0];
    console.log('User created successfully:', newUser);

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

//to get all users
export const getAllUsers = async (): Promise<{ id: string, username: string, password: string }[]> => {
  try {
    const result = await pool.query(`
      SELECT id, username, password
      FROM users;
    `);

    // Extract the user data from the result
    const users = result.rows;
    console.log('Users retrieved successfully:', users);

    return users;
  } catch (error) {
    console.error('Error retrieving users:', error);
    throw error;
  }
};


//to get user by UserName
export const getUserByUserName = async (userName: string): Promise<{ id: string, username: string, password: string } | null> => {
  try {
    const result = await pool.query(`
      SELECT id, username, password
      FROM users
      WHERE username = $1;
    `, [userName]);

    // Extract the user data from the result
    const user = result.rows[0] || null;
    console.log('User retrieved successfully:', user);

    return user;
  } catch (error) {
    console.error('Error retrieving user by username:', error);
    throw error;
  }
};


//to get user by id
export const getUserById = async (userId: string): Promise<{ id: string, username: string, password: string } | null> => {
  try {
    const result = await pool.query(`
      SELECT id, username, password
      FROM users
      WHERE id = $1;
    `, [userId]);

    // If no user is found, return null
    if (result.rows.length === 0) {
      return null;
    }

    // Extract the user data from the result
    const user = result.rows[0];
    console.log('User retrieved successfully:', user);

    return user;
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    throw error;
  }
};


