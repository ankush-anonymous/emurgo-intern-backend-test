import { createUser, getAllUsers,authenticateUser,getUserById} from "../controllers/usersController";
import { jwtAuth, jwtPlugin } from "../plugins/jwtPlugin";


async function routes(fastify,options){
    fastify.post("/users",createUser);
    fastify.get("/users/:userId",getUserById);
    fastify.get("/users",{onRequest:[jwtAuth]},getAllUsers);
    fastify.post("/users/authenticate",authenticateUser)
 
}

export default routes;