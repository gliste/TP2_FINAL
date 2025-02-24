import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import purcharsesRouter from "./routes/purchases.js";



const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/purchases", purcharsesRouter);



app.listen(PORT, () => {
  console.log("Servidor Web en el puerto:", PORT);
});
