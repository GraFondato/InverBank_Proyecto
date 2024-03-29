let path = require("path");
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const session = require('express-session')

const db = require('../../database/models');
const { log } = require("console");
const profileRoute = path.resolve(__dirname, "../views/users/profile"); 
const rutaRegistro = path.resolve(__dirname, "../views/users/register");
let rutaproducto = true;

const controller = {
    register: (req, res) => {
        res.render(rutaRegistro);
    },

    processRegister: (req, res) => {
    const resultValidation = validationResult(req);

    if (resultValidation.errors.length > 0) {
        res.render(rutaRegistro, {
            errors: resultValidation.mapped(),
            oldData: req.body,
            rutaproducto
        });
    } else {
        let usuarioRegistrado;

        db.User.findOne({ where: { email: req.body.email } })
            .then((resultados) => {
                usuarioRegistrado = resultados;

                if (usuarioRegistrado) {
                    res.render(rutaRegistro, {
                        errors: {
                            email: {
                                msg: "Este email ya está registrado"
                            }
                        },
                        oldData: req.body
                    });
                } else {
                    return db.User.create({
                        name: req.body.name,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: bcryptjs.hashSync(req.body.password, 10),
                    });
                }
            })
            .then(() => {
                // Iniciar sesión después de registrar al usuario
                req.session.userLogged = usuarioRegistrado;
                if (req.body.sesion) {
                    res.cookie('userEmail', req.body.email, { maxAge: ((1000 * 60) * 60) * 24 });
                }
                return res.redirect("/users/profile");
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).send("Error en el registro del usuario.");
            });
        console.log("Datos del formulario:", req.body.email);
        }
        
},
    login: (req, res) => {
        let ruta = path.resolve(__dirname, "../views/users/login");
        res.render(ruta, { rutaproducto });
    },
    
    loginProcess: (req, res) => {
        const resultValidation = validationResult(req);
        if (resultValidation.errors.length > 0) {
            return res.render(path.resolve(__dirname, "../views/users/login"), {
                errors: resultValidation.mapped(),
                oldData: req.body,
                rutaproducto
            })
        };

        let userToLogin 
        let passwordOk
        db.User.findOne({ where: { email: req.body.email } })
            .then((resultados) => {
                console.log(resultados)
                userToLogin = resultados
                if (userToLogin) {
                    passwordOk = bcryptjs.compareSync(req.body.password, userToLogin.password);
                    return passwordOk
                } else {
                    return res.render(path.resolve(__dirname, "../views/users/login"),{
                    errors: { 
                    email: {msg:"Error al encontrar el usuario"}
                }});
                }
            })
            .then((passwordOk) => {
                if (passwordOk) {
                    console.log("Contraseña correcta:", passwordOk);
                    req.session.userLogged = userToLogin; 
                    if (req.body.sesion) {
                        res.cookie('userEmail', req.body.email, { maxAge: ((1000 * 60) * 60) * 24})
                    }
                    return res.redirect("/users/profile");
                } else {
                    return res.render(path.resolve(__dirname, "../views/users/login"),{
                    errors: {
                        email: {msg: "Las credenciales son invalidas"}
                    }
                });
                }
            })
            .catch((err)=>{
                console.log(err)
            })

        
        },
    profile: (req, res) => {
        let logged = true;
        
        return res.render(profileRoute, {
            rutaproducto,
            user: req.session.userLogged,
            logged
        });
    },
    
    logout: (req, res) => {
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');
    },
}

module.exports = controller;