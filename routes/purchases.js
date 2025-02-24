import express from "express";
import {
  rolAdministrador,
  rolUsuario,
} from "../middleware/roles.js";
import auth from "../middleware/auth.js";
import {
  addPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesByUserId,
  validateStockOfProducts,
} from "../data/purchase.js";
import validator from "validator";
import {
  normalizarBodyAgregarCompra,
  validarBodyAgregarCompra,
} from "../utils/validaciones.js";


const purcharsesRouter = express.Router();

const MSG_ERROR_COMPRA_NO_ENCONTRADA = "La compra no existe";

purcharsesRouter.get("/", auth, rolAdministrador, async (req, res) => {
  try {
    const purchases = await getAllPurchases();
    res.status(200).send(purchases);
  } catch (error) {
    //si hay error de servidor se envía respuesta
    res.status(500).send(error.message);
  }
});

purcharsesRouter.get("/my-purchases", auth, rolUsuario, async (req, res) => {
  try {
    const { _id } = req.user;
    const result = await getPurchasesByUserId(_id);
    res.status(201).send(result);
  } catch (error) {
    //en caso de error se responde con dicho error
    res.status(500).send(error.message);
  }
});

purcharsesRouter.get("/:id", auth, rolAdministrador, async (req, res) => {
  try {
    //se obtiene el id del request
    const { id } = req.params;
    //se valida que el id exista en la base de datos
    if (!validator.isMongoId(id)) {
      return res.status(404).send({ error: MSG_ERROR_COMPRA_NO_ENCONTRADA });
    }
    //se obtiene la compra por id
    const purchase = await getPurchaseById(id);

    //si la compra no existe se devuelve un msg de error
    if (!purchase) {
      return res.status(404).send({ error: MSG_ERROR_COMPRA_NO_ENCONTRADA });
    }
    //si pasa todas las validaciones, se enví exitoso y la compra
    res.status(200).send(purchase);
  } catch (error) {
    //si hay error de servidor se envía mensaje
    res.status(500).send(error.message);
  }
});

purcharsesRouter.post("/new", auth, rolUsuario, async (req, res) => {
    try {
        const body = req.body;
        //se valida el body
        const error = validarBodyAgregarCompra(body);

        //si hay un error, se reponde con dicho error
        if(error){
            return res.status(422).send({error: error});
        }

        //se normaliza el body
        const items = normalizarBodyAgregarCompra(body);
        
        const hayStock = await  validateStockOfProducts(items);
        if(!hayStock){
            return res.status(409).send({
                error: "No existe o no hay stock de algunos de los productos seleccionados",
            });
        }
        const {_id} = req.user;
        const result = await addPurchase(items, _id);

        res.status(201).send(result);
        
    } catch (error) {
        //si hay error de servidor se responde con ese error
        res.status(500).send(error.message);
    }
});
export default purcharsesRouter;
