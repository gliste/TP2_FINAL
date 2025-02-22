import express from "express";
import { validarBodyRegistro } from "../utils/validaciones.js";
import { addUser, getUserByEmail } from "../data/user.js";

const usersRouters = express.Router(); //enrutador de los endpoints
const MSG_ERROR_EXISTE_USUARIO =
  "Ya existe un usuario registrado con ese email.";

//declaracion de  ruta
usersRouters.post("/register", async (req, res) => {
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

export default usersRouters;
