const { response, request } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async (req = request, res = response) => {

    const { email, name, password } = req.body;

    try {
        // verificar el email
        const usuario = await Usuario.findOne({email}); //busca si el usuario existe con ese correo
        if(usuario){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe con ese email'
            })
        }
        //Crear usuario con el modelo
        const dbUsuario = new Usuario(req.body);

        //Hashear la password
        const salt = bcrypt.genSaltSync();
        dbUsuario.password = bcrypt.hashSync( password, salt );

        //Generar el JWT
        const token = await generarJWT(dbUsuario.id, name);

        //Crear usuario de BD
        await dbUsuario.save();

        //Generar respuesta exitosa
        return res.status(201).json({
            ok:true,
            uid: dbUsuario.id,
            name,  
            token          
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: true,
            msg: "Error en el Servidor"
        })
    }

}





const loginUsuario = async(req = request, res = response) => {

    const { email, password } = req.body;

    try {
        const dbUsuario = await Usuario.findOne({email});

        if(!dbUsuario){
            return res.status(400).json({
                ok:false,
                msg: 'El correo no existe'
            });
        }

        //Confirmar si el password hace match
        const validPassword = bcrypt.compareSync(password, dbUsuario.password);

        if(!validPassword){
            return res.status(400).json({
                ok:false,
                msg: 'El password no existe'
            });
        }

        //Generar el JWT
        const token = await generarJWT(dbUsuario.id, dbUsuario.name);

        //Respuesta del servicio
        return res.json({
            ok: true,
            uid: dbUsuario.id,
            name: dbUsuario.name,
            token
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            ok: true,
            msg: "Error en el Servidor"
        })
    }

    return res.json({
        ok: true,
        msg: "Login de usuario /"
    })
}

const revalidarToken = async(req = request, res = response) => {

    const { uid, name } = req;

    //Generar el JWT
    const token = await generarJWT(uid, name);

    return res.json({
        ok: true,
        uid,
        name,
        token
    })
}

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}