import { Decimal128 } from "mongodb";
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

export function normalizarBodyAgregarProducto(body) {
  const { description, category, stock, price } = body;
  const bodyNormalizado = {};
  bodyNormalizado.description = description.trim();
  bodyNormalizado.category = category.trim();
  bodyNormalizado.stock = parseInt(stock);
  const truncatedPrice = Math.floor(parseFloat(price) * 100) / 100;
  bodyNormalizado.price = Decimal128.fromString(truncatedPrice.toFixed(2));
  return bodyNormalizado;
}

export function normalizarBodyEditarProducto(body) {
  const { description = "", category = "", stock = "", price = "" } = body;
  const bodyNormalizado = {};
  if (!validator.isEmpty(description)) {
    bodyNormalizado.description = description.trim();
  }
  if (!validator.isEmpty(category)) {
    bodyNormalizado.category = category.trim();
  }

  if (!validator.isEmpty(stock)) {
    bodyNormalizado.stock = parseInt(stock);
  }

  if (!validator.isEmpty(price)) {
    const truncatedPrice = Math.floor(parseFloat(price) * 100) / 100;
    bodyNormalizado.price = Decimal128.fromString(truncatedPrice.toFixed(2));
  }

  return bodyNormalizado;
}

export function validarBodyEditarProducto(body) {
  try {
    const { description, category, stock, price } = body;
    if (description && validator.isEmpty(description)) {
      throw new Error(MSG_ERROR_DESCRIPTION);
    }

    if (category && validator.isEmpty(category)) {
      throw new Error(MSG_ERROR_CATEGORY);
    }

    if (stock && (!validator.isInt(stock) || stock < 0)) {
      throw new Error(MSG_ERROR_STOCK);
    }

    if (price && (!validator.isNumeric(price) || price < 0)) {
      throw new Error(MSG_ERROR_PRICE);
    }

    if (!description && !category && !stock && !price) {
      throw new Error(MSG_ERROR_EDITAR);
    }
    return null;
  } catch (error) {
    return error.message;
  }
}

export function validarBodyAgregarProducto(body) {
  try {
    const { description, category, stock, price } = body;
    if (!description || !category || !stock || !price) {
      throw new Error(
        `${MSG_ERROR_OBLIGATORIOS} se requieren descripcion, categoria, stock y precio.`
      );
    }

    if (
      validator.isEmpty(description) ||
      validator.isEmpty(category) ||
      validator.isEmpty(stock) ||
      validator.isEmpty(price)
    ) {
      throw new Error(
        `${MSG_ERROR_OBLIGATORIOS} se requieren descripcion, categoria, stock y precio.`
      );
    }
    if (!validator.isInt(stock) || stock < 0) {
      throw new Error(MSG_ERROR_STOCK);
    }

    if (!validator.isNumeric(price) || price < 0) {
      throw new Error(MSG_ERROR_PRICE);
    }
    return null;
  } catch (error) {
    return error.message;
  }
}

export function validarBodyAgregarCompra(body){
  try {
    const {items} = body;
    if(!Array.isArray(items) || items.length === 0){
      throw new Error("La compra no puede realizarse por falta de productos.");
    }

    for (const item of items){
      if (
        !item.productId ||
        validator.isEmpty(item.productId) ||
        !validator.isMongoId(item.productId)
      ){
        let error = "Por favor especificar el producto a comprar";
        if(item.productId) {
          error = `El id de producto ${item.productId} no es válido.`;
        }
        throw new Error(error);
      }

      if (
        !item.quantity || 
        !validator.isInt(item.quantity) ||
        item.quantity <= 0
      ) {
        let error = "Por favor especificar el producto a comprar";
        if(item.quantity){
          error = `La cantidad del producto ${item.productId} debe ser mayor a 0. `;
        }
        throw new Error(error);
      }
    }
      return null;
    } catch(error){
      return error.message;
    }
   
}

export function normalizarBodyAgregarCompra(body){
  const {items} = body;
  const itemsNormalizados = [];

  for(const item of items){
    const {productId, quantity} = item;
    itemsNormalizados.push({
      productId: productId.trim(),
      quantity: parseInt(quantity),
    });
  }
  return itemsNormalizados;
}


