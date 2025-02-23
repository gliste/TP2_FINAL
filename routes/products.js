import express from "express";
import { rolAdministrador } from "../middleware/roles.js";
import auth from "../middleware/auth.js";
import {
  activateProductById,
  addProduct,
  getAllProducts,
  getProductByDescription,
  getProductById,
  unActivateProductById,
  updateProduct,
} from "../data/product.js";
import {
  normalizarBodyAgregarProducto,
  normalizarBodyEditarProducto,
  validarBodyAgregarProducto,
  validarBodyEditarProducto,
} from "../utils/validaciones.js";
import validator from "validator";

const productsRouter = express.Router();

const MSG_ERROR_PRODUCTO_EXISTE =
  "Ya existe un producto con la misma descripción";

const MSG_ERROR_PRODUCTO_NO_ENCONTRADO = "El producto no existe";
const MSG_ERROR_DESACTIVAR_PRODUCTO =
  "El producto no existe o el mismo ya fue desactivado.";
const MSG_ERROR_ACTIVAR_PRODUCTO =
  "El producto no existe o el mismo ya fue activado.";
const MSG_ERROR_EDITAR_PRODUCTO =
  "El producto no existe o no esta activo, no se pudo editar";

productsRouter.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

productsRouter.get("/:id", async (req, res) => {
  try {
    //se obtiene el id del request
    const { id } = req.params;
    //se valida que el id sea un id valido en bbdd
    if (!validator.isMongoId(id)) {
      return res.status(404).send({ error: MSG_ERROR_PRODUCTO_NO_ENCONTRADO });
    }
    //Se obtiene el producto por el id
    const product = await getProductById(id);
    //Si el producto no se encuentra se informa con msg correspondiente
    if (!product || !product.available) {
      return res.status(404).send({ error: MSG_ERROR_PRODUCTO_NO_ENCONTRADO });
    }

    // si pasa validación, se envía msg exitoso y el producto
    res.status(200).send(product);
  } catch (error) {
    //si hay error de servidor se envía respuesta
    res.status(500).send(error.message);
  }
});

//ruta validada, el usuario tiene que estar autenticado y ademas tener el rol admin
productsRouter.post("/add", auth, rolAdministrador, async (req, res) => {
  try {
    //se obtiene el body del request
    let body = req.body; 
    //se valida lo que se guardó en la variable body

    const error = validarBodyAgregarProducto(body);

    //si hay algún error, se responde con dicho error
    if (error) {
      return res.status(422).send({ error: error });
    }

    //se normaliza el body

    body = normalizarBodyAgregarProducto(body);

    //se verifica si ya existe algún producto con ese nombre

    const product = await getProductByDescription(body.description);

    //si exite el producto con ese nombre, se retorna un error
    if (product) {
      return res.status(409).send({ error: MSG_ERROR_PRODUCTO_EXISTE });
    }
    //si no exite el producto se guarda en la bbdd y retorna exitoso
    const result = await addProduct(body);
    res.status(201).send(result);
  } catch (error) {
    //si hay un error de servidor envía respuesta
    res.status(500).send(error.message);
  }
});

productsRouter.put(
  "/unactivate/:id",
  auth,
  rolAdministrador,
  async (req, res) => {
    try {
      //se accede al atributo id del request
      const { id } = req.params;
      //se valida que el id exista en la bbdd
      if (!validator.isMongoId(id)) {
        //sino existe se envía respuesta de no encontrado
        return res
          .status(404)
          .send({ error: MSG_ERROR_PRODUCTO_NO_ENCONTRADO });
      }
      //se desactiva el producto por el id
      const result = await unActivateProductById(id);
      //si no hay resultado positivo, devuelvo error
      if (!result) {
        return res.status(409).send({ error: MSG_ERROR_DESACTIVAR_PRODUCTO });
      }

      //si pasa todas las validaciones, se retorna exitoso
      res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
);

productsRouter.put(
  "/activate/:id",
  auth,
  rolAdministrador,
  async (req, res) => {
    try {
      //se obtiene el id del request
      const { id } = req.params;

      //se valida que el id obtenido sea uno existente en la bbdd
      if (!validator.isMongoId(id)) {
        return res
          .status(404)
          .send({ error: MSG_ERROR_PRODUCTO_NO_ENCONTRADO });
      }
      //se activa el producto por el id
      const result = await activateProductById(id);

      //si no hay resultado positivo, retona msg de error
      if (!result) {
        return res.status(409).send({ error: MSG_ERROR_ACTIVAR_PRODUCTO });
      }
      res.status(200).send(result);
    } catch (error) {
      //en caso de error de servidor se envía mensaje
      return res.status(500).send(error.message);
    }
  }
);

productsRouter.put("/update/:id", auth, rolAdministrador, async (req, res) => {
  try {
    //se obtiene el id del request
    const { id } = req.params;
    //se valida que el id sea uno existente en la bbdd
    if (!validator.isMongoId(id)) {
      return res.status(404).send({ error: MSG_ERROR_PRODUCTO_NO_ENCONTRADO });
    }
    //se obtiene el body del request
    let body = req.body;
    //se valida la variable body
    const error = validarBodyEditarProducto(body);
    //si hay algún error, se responde con ese error
    if (error) {
      return res.status(422).send({ error: error });
    }
    //se normaliza el body
    body = normalizarBodyEditarProducto(body);

    //activo el producto por el id
    const result = await updateProduct(body, id);

    //si no hay resultado positivo, se retorna el error
    if (!result) {
      return res.status(409).send({ error: MSG_ERROR_EDITAR_PRODUCTO });
    }
    res.status(200).send(result);
  } catch (error) {
    //si hay error de servidor se envía mensaje
    return res.status(500).send(error.message);
  }
});

export default productsRouter;
