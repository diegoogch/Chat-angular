//2. importando modelo
import {mensajes_model} from './../models/mensajes';


//1. Configurado Sequelize
const Sequelize = require('sequelize');

//base de datos,usuario,contraseña
export const sequelize = new Sequelize('mensajes','root','',{
    host:'localhost',
    dialect:'mysql',
    timezone:'-05:00',

});

export const Mensajes = mensajes_model(sequelize,Sequelize);