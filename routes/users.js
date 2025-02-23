import express from "express";
import { validarBodyRegistro } from "../utils/validaciones.js";
import {
  addUser,
  generateAuthToken,
  getUserByCredentials,
  getUserByEmail,
} from "../data/user.js";

const usersRouter = express.Router(); //enrutador de los endpoints
const MSG_ERROR_EXISTE_USUARIO =
  "Ya existe un usuario registrado con ese email.";

const MSG_ERROR_LOGIN_INCOMPLETO =
  "Usuario y password obligatorios para iniciar sesión";
const MSG_CREDENCIALES_INVALIDAS = "Credenciales inválidas";

//declaracion de  ruta
usersRouter.post("/register", async (req, res) => {
  //registra usuarios
  try {
    const body = req.body; //se captura el body de la petición
    const error = validarBodyRegistro(body); //devuelve un error o un nulo
    if (error) {
      return res.status(400).send({ error: error }); //se retorna un mensaje de error
    }
    const user = await getUserByEmail(body.email);
    if (user) {
      return res.status(409).send({ error: MSG_ERROR_EXISTE_USUARIO }); //existe el usuario buscado por su mail
    }
    const result = await addUser(body);
    res.status(201).send(result);
  } catch (error) {
    //si hay error de servidor respondo
    res.status(500).send({ error: error.message }); //es un objeto
  }
});

usersRouter.get("/login", async (req, res) => {
  try {
    //desestructuro el body
    const { email, password } = req.body;

    //si no existe email o password en el body respondo con error de login incompleto
    if (!email || !password) {
      return res.status(400).send({
        error: MSG_ERROR_LOGIN_INCOMPLETO,
      });
    }

    //busco el usuario por mail y password
    const user = await getUserByCredentials(email, password);

    //si el usuario no existe con esas credenciales respondo con error que las credenciales son invalidas
    if (!user) {
      return res.status(401).send({
        error: MSG_CREDENCIALES_INVALIDAS,
      });
    }

    //genero el token
    const token = await generateAuthToken(user);

    //repondo success con el token
    res.status(200).send({ token });
  } catch (error) {
    //si hay error de servidor respondo
    res.status(500).send(error.message);
  }
});

//agregué para ver todos los usuarios
usersRouter.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default usersRouter;
