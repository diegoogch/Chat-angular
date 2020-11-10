"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//2. importando modelo
const mensajes_1 = require("./../models/mensajes");
//1. Configurado Sequelize
const Sequelize = require('sequelize');
//base de datos,usuario,contraseña
exports.sequelize = new Sequelize('mensajes', 'root', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-05:00',
});
exports.Mensajes = mensajes_1.mensajes_model(exports.sequelize, Sequelize);
