import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";

const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.USERS_COLLECTION;

export async function getUserByEmail(email) {
  const client = await getConnection(); //intermediario con la bd
  const user = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .findOne({ email: email });
  return user;
}

export async function addUser(data) {
  //el data representa el body recibido
  const client = await getConnection();
  const hashedPassword = await bcryptjs.hash(data.password, 10);
  data.password = hashedPassword;
  data.role = "user"; //se agrega un atributo nuevo en este caso Rol
  const user = await client.db(DATABASE).collection(COLLECTION).insertOne(data);
  return user;
}
