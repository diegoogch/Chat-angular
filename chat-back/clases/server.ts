import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import {Response,Request, NextFunction} from 'express';
import { Clientes } from './clientes';
import { Cliente } from './cliente';
import {sequelize} from './../config/sequelize';
//IMPORTANDO MENSAJES DE SEQUELIZE
import {Mensajes} from './../config/sequelize';



interface mensaje{
    de:string,
    para:string,
    mensaje:string
}

export default class Server{
    public app:express.Application;
    public puerto:any;
    public httpServer:http.Server;
    public io:socketIO.Server;
    public clientes:Clientes = new Clientes();

    constructor(){
        this.app = express();
        this.app.use((req:Request,res:Response,next:NextFunction)=>{
            res.header('Access-Control-Allow-Origin','http://localhost:4200');
            res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
            res.header('Access-Control-Allow-Methods','GET, POST');
            res.header('Allow','GET, POST');
            next();
        });
        this.httpServer = new http.Server(this.app);
        this.io = socketIO(this.httpServer);

        this.puerto = process.env.PORT || 3700;
        this.configurarBodyParser();
        this.asignarRutas();
        this.escucharSockets();
        //USAR esta porción de cÓdigo en caso de no tener modelos y poder probar la autenticaciÓN
        // sequelize.authenticate().then(()=>{
        //     console.log("hubo magia y se conecto a la BD");
        // }).catch((err:any) =>{
        //     console.log("no hubo magia erroral conectar", err);
        // })
        sequelize.sync({force:false}).then(()=>{
            console.log("hubo magia y se conecto a la BD");
        }).catch((err:any) =>{
            console.log("no hubo magia error al conectar", err);
        })
    }

    configurarBodyParser(){
        var bodyParser = require('body-parser');
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }

    escucharSockets(){
        console.log("Escuchando los sockets");

        this.io.on('connect',(cliente)=>{
            
            let objCliente = new Cliente(cliente.id);
            this.clientes.add(objCliente);
            console.log("nueva lista de conectados");
            console.log(this.clientes.getClientes());    

            cliente.on('disconnect',()=>{
                console.log(`El cliente ${cliente.id} se desconectó`);
                this.clientes.remove(cliente.id);
                this.io.emit('retorno-usuarios',this.clientes.getClientes());
            });

            cliente.on('configurar-usuario',(data)=>{
                let objCliente = new Cliente(cliente.id);
                objCliente.nombre = data;
                this.clientes.update(objCliente);
                console.log("nueva lista de conectados");
                console.log(this.clientes.getClientes());
                this.io.emit('retorno-usuarios',this.clientes.getClientes());
            });

            cliente.on('lista-usuarios',()=>{
                this.io.emit('retorno-usuarios',this.clientes.getClientes());
            });

            cliente.on('enviar-mensaje',(mensaje)=>{
                let objCliente:any = this.clientes.getClienteById(cliente.id);
                let content = {
                    mensaje:mensaje,
                    nombre: objCliente.nombre
                }
                
                Mensajes.create({mensaje_text:content.mensaje}).then(() => {
                    Mensajes.count().then((count:any)=>{
                        console.log('contador',count);
                        //contador-mensajes es un nuevo evento que he creado
                        this.io.emit('contador-mensajes',count)
                        console.log('elmensaje',content.mensaje);
                        this.io.emit('nuevo-mensaje',content);
                    });
                    
                });
                
                // Cuando el cliente quiere emitir un evento
                // a todos los clientes conectados, excepto
                // a sí mismo.
                // cliente.broadcast.emit('evento',contenido);
            });

        });
    }

    asignarRutas(){
        this.app.get('/',(req,res)=>{
            res.send("Buenas");
        });
        this.app.post('/enviar-mensaje',(req,res)=>{
            let {para,mensaje,de} = req.body;
            let content = {
                mensaje:mensaje,
                nombre:de
            };
            this.io.to(para).emit('nuevo-mensaje',content);
            res.status(200).send('');
        })
    }

    start(){
        this.httpServer.listen(this.puerto,()=>{
            console.log("Servidor corriendo exitosamente en el puerto "
                        + this.puerto);
        });
    }
}