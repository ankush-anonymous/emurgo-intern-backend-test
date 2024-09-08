import {createBook,attachBookToUser,getAllBooks,getBookById} from "../controllers/booksController";
import { jwtAuth, jwtPlugin } from "../plugins/jwtPlugin";

async function routes(fastify,options){
    
    fastify.post("/books",{onRequest:[jwtAuth]},createBook);
    fastify.get("/books/:bookId",getBookById);
    fastify.get("/books",getAllBooks);
    fastify.post("/users/:userId/books/:bookId",{onRequest:[jwtAuth]},attachBookToUser);
    
}

export default routes;
