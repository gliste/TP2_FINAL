import jwt from "jsonwebtoken";

const MSG_ERROR_PERMISOS = "No cuenta con permisos para realizar esta acción.";

async function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: MSG_ERROR_PERMISOS });

  jwt.verify(token, process.env.CLAVE_SECRETA, (err, user) => {
    if (err) return res.status(403).json({ error: MSG_ERROR_PERMISOS });
    req.user = user;
    next();
  });
}

export default auth;
