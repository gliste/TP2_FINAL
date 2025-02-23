import getConnection from "./connection.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
//import { ObjectId } from "mongodb";

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

export async function getUserByCredentials(email, password) {
  let user = await getUserByEmail(email);
  if (user) {
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      user = null;
    }
  }
  return user;
}

export async function generateAuthToken(user) {
  const token = await jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.CLAVE_SECRETA,
    { expiresIn: "1h" }
  );
  return token;
}
