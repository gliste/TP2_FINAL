import validator from "validator"; //un plugin de validacion

const MSG_ERROR_OBLIGATORIOS = "Faltan campos obligatorios:";
const MSG_ERROR_EMAIL =
  "El email es inválido, el mismo debe ser usuario@dominio.com";
const MSG_ERROR_PASSWORDS = "Las contreñas no coinciden.";

//se destructura ({}) el body recibido para poder validar cada campo
export function validarBodyRegistro(body) {
    let res = null;
  try {
   
    //estos datos son lo que se validan del body

    const { email, password, r_password, name, lastname } = body;
    if (!email || !password || !r_password || !name || !lastname) {
      throw new Error(
        `${MSG_ERROR_OBLIGATORIOS} se requieren nombre, apellido, email, contraseña y la confirmación de la misma.`
      );
    }

    if (
      validator.isEmpty(email) ||
      validator.isEmpty(password) ||
      validator.isEmpty(r_password) ||
      validator.isEmpty(name) ||
      validator.isEmpty(lastname)
    ) {
      throw new Error(
        `${MSG_ERROR_OBLIGATORIOS} se requieren nombre, apellido, email, contraseña y la confirmación de la misma.`
      );
    }

    if (!validator.isEmail(email)) {
      throw new Error(MSG_ERROR_EMAIL);
    }

    if (password !== r_password) {
      //validan que sean distinto estricto, es decir que también el tipo de dato.
      throw new Error(MSG_ERROR_PASSWORDS);
    }
  } catch (error) {
    res = error.message;
  }

  return res;
}
