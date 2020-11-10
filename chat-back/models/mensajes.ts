import {Sequelize} from 'sequelize';

export var mensajes_model =(sequelize:Sequelize,type:any)=>{
    var mensajes_model = sequelize.define('t_mensajes',{
        mensajes_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false,
        },
        mensaje_text:{
            type:type.STRING(140),
        
        },
        
    });

    return mensajes_model;
}