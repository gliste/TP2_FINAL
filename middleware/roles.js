const ROLE_ADMINISTRADOR = "admin";
const ROLE_USER = "user";

const MSG_ERROR_PERMISOS = "Usuario sin permisos.";

export const rolAdministrador = (req, res, next) => {
    const {role} = req.user;

    if(role !== ROLE_ADMINISTRADOR){
        return res.status(403).send({error: MSG_ERROR_PERMISOS});
    }

    next();
};

export const rolUsuario = (req, res, next) => {
    const {role} = req.user;

    if(role !== ROLE_USER){
        return res.status(403).send({error: MSG_ERROR_PERMISOS});
    }

    next();
};
