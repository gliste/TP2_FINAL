import getConnection from "./connection.js";
import { getProductById, updateProductStock } from "./product.js";
import { ObjectId } from "mongodb";
import { addPurcharseToUser, getUserById } from "./user.js";

const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.PURCHASES_COLLECTION;

export async function getAllPurchases() {
  const client = await getConnection();
  const purchases = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .find()
    .toArray();
const purchasesWithProductDetails = await Promise.all(
    purchases.map(async (purchase) => {
        const itemsWithDetails = await Promise.all(
            purchase.items.map(async (item) => {
                const product = await getProductById(item.productId);
                return {
                    quantity: item.quantity,
                    name: product.description,
                    price: parseFloat(product.price.toString()).toFixed(2), 
                };
            })
        );
const total = itemsWithDetails
        .reduce((acc, item) => {
            return acc + parseFloat(item.price) * item.quantity;
        }, 0)
        .toFixed(2);
    return {
        date: purchase.date,
        total: total,
        items: itemsWithDetails,
    };    
    })
);
return purchasesWithProductDetails;
}

export async function getPurchaseById(id) {
    const client = await getConnection();
    const objectId = new ObjectId(id);
    const purchase = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .findOne({_id: objectId });
    let purchaseWithDetails = null;
    if(purchase){
        const itemsWithDetails = await Promise.all(
            purchase.items.map(async (item) => {
                const product = await getProductById(item.productId);
                return {
                    quantity: item.quantity,
                    name: product.description,
                    price: parseFloat(product.price.toString()).toFixed(2),
                };
            })
        );
    const total = itemsWithDetails
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);
    purchaseWithDetails = {
        date: purchase.date,
        total: total,
        items : itemsWithDetails,
    };
    }
     return purchaseWithDetails;
}

export async function validateStockOfProducts(data) {
    let i = 0;
    let result = true;
    while(result && i< data.length){
        const productId = data[i].productId;
        const quantity = data[i].quantity;
        const product = await getProductById(productId);
        
        if(!product || quantity > product.stock){
            result = false;
        }else{
            i++;
        }
    }
    return result;
}

export async function addPurchase(items, userId) {
    const client = await getConnection();
    for (const item of items){
        await updateProductStock(item.productId, item.quantity);
        item.productId = new ObjectId(item.productId);
    }
    const purcharse = await client.db(DATABASE).collection(COLLECTION).insertOne({
        items : items,
        date: new Date(),
    });
    await addPurcharseToUser(purcharse.insertedId, userId);

    return purcharse;
    
}

export async function getPurchasesByUserId(userId) {
    const user = await getUserById(userId);
    const client = await getConnection();
    const purchases = await client
    .db(DATABASE)
    .collection(COLLECTION)
    .find({_id: { $in: user.purchases}})
    .toArray();

    const purchasesWithProductDetails = await Promise.all(
        purchases.map(async (purchase) => {
            const itemsWithDetails = await Promise.all(
                purchase.items.map(async (item) => {
                    const product = await getProductById(item.productId);
                    return {
                        quantity: item.quantity,
                        name: product.description,
                        price: parseFloat(product.price.toString()).toFixed(2),

                    };
                })
            );
            const total = itemsWithDetails
            .reduce((acc, item) => {
                return acc + parseFloat(item.price) * item.quantity;
            }, 0)
            .toFixed(2);
            return {
                date: purchase.date,
                total: total,
                items: itemsWithDetails,
            };
        })
    );
    return purchasesWithProductDetails;
    
}
