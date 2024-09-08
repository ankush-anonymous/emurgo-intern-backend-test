import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: databaseUrl
});

export const createBook = async (
  bookName: string
): Promise<{ id: string, bookName: string }> => {
  try {
    // Insert the new book and return the newly inserted row
    const result = await pool.query(`
      INSERT INTO books (bookName)
      VALUES ($1)
      RETURNING id, bookName;
    `, [bookName]);

    // Extract the book data from the result
    const newBook = result.rows[0];
    console.log('Book created successfully:', newBook);

    return newBook;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};


//to get book by id
export const getBookById = async (
  bookId: string
): Promise<{ id: string, bookName: string, userId: string | null }> => {
  try {
    // Query the database to get the book by ID
    const result = await pool.query(`
      SELECT id, bookName, userId
      FROM books
      WHERE id = $1;
    `, [bookId]);

    // Check if a book was found
    if (result.rows.length === 0) {
      throw new Error('Book not found');
    }

    // Extract the book data from the result
    const book = result.rows[0];
    console.log('Book retrieved successfully:', book);

    return book;
  } catch (error) {
    console.error('Error retrieving book by ID:', error);
    throw error;
  }
};

//to get all books
export const getAllBooks = async (): Promise<{ id: string, bookName: string, userId: string | null }[]> => {
  try {
    // Query the database to get all books
    const result = await pool.query(`
      SELECT id, bookName, userId
      FROM books;
    `);

    // Extract the books data from the result
    const books = result.rows;
    console.log('Books retrieved successfully:', books);

    return books;
  } catch (error) {
    console.error('Error retrieving all books:', error);
    throw error;
  }
};



export const attachBookToUser = async (
  userId: string,
  bookId: string
): Promise<{ id: string, bookName: string, userId: string }> => {
  try {
    const result = await pool.query(`
      UPDATE books
      SET userId = $1
      WHERE id = $2
      RETURNING id, bookName, userId;
    `, [userId, bookId]);

    const updatedBook = result.rows[0];
    console.log('Book attached to user successfully:', updatedBook);

    return updatedBook;
  } catch (error) {
    console.error('Error attaching book to user:', error);
    throw error;
  }
};