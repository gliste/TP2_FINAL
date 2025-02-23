import getConnection from "./connection.js";
import { ObjectId } from "mongodb";

const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.PRODUCTS_COLLECTION;

export async function getAllProducts() {
  const client = await getConnection();
  const products = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .find({ available: true })
    .toArray();
  return products;
}

export async function getProductByDescription(description) {
  const client = await getConnection();
  const products = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .find({ description: description });
  return products;
}

export async function addProduct(data) {
  const client = await getConnection();
  data.availabe = true;
  const product = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .insertOne(data);
  return product;
}

export async function getProductById(id) {
  const client = await getConnection();
  const product = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .findOne({ id: id });
  return product;
}

export async function unActivateProductById(id) {
  let result = null;
  const product = await getProductById(id);

  if (product && product.availabe) {
    result = await changeAvailability(id, false);
  }
  return result;
}

async function changeAvailability(id, boolean) {
  const client = await getConnection();
  const objectId = new ObjectId(id); 
  const result = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .updateOne({ _id: objectId }, { $set: { available: boolean } });

  return result;
}

export async function activateProductById(id) {
  let result = null;
  const product = await getProductById(id);

  if (product && !product.availabe) {
    result = await changeAvailability(id, true);
  }
  return result;
}

export async function updateProduct(data, id) {
  let result = null;
  const product = await getProductById(id);
  if (product && product.available) {
    const updateQuery = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        updateQuery[key] = data[key];
      }
    }
    const objectId = new ObjectId(id);
    const client = await getConnection();
    result = await client
      .db(DATABASE)
      .collection(COLLECTION)
      .updateOne({ _id: objectId }, { $set: updateQuery });
  }
  return result;
}

export async function updateProductStock(id, quantity) {
  const client = await getConnection();
  const objectId = new ObjectId(id);
  const result = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .updateOne({ _id: objectId }, { $inc: { stock: -quantity } });
  return result;
}
