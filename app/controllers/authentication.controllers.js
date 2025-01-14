import bcryptjs from 'bcryptjs';
import JsonWebToken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

const regex_email = /.+@(gmail|hotmail|icloud|outlook)\.com/;
const regex_usuarioID = /\d{1,5}/;




async function login(solicitud,respuesta){

   let parametros = [];
   let usuarioID_o_correo = solicitud.body.user_or_email;
   let contraseña = solicitud.body.password;

   if(!usuarioID_o_correo || !contraseña){
       respuesta.send({campos_vacios:true});
   }
   else{

       let consulta = 'select * from usuarios where usuario_id = ? or correo = ?'
       parametros = [usuarioID_o_correo,usuarioID_o_correo];

       // primero validar el ID o el correo

       let usuarioID_valido = regex_usuarioID.test(usuarioID_o_correo);
       let correo_valido = regex_email.test(usuarioID_o_correo);

       if(usuarioID_valido == false && correo_valido == false){
           respuesta.send({campos_incorrectos:true});
       }
       else{

            let a_buscar;
            if(correo_valido == true) a_buscar = "correo";
            else a_buscar = "usuario";

            // segundo buscar al usuario o el email
            solicitud.database.query(consulta,parametros, async (error,resultados)=>{
                if(error)
                  throw error;
                
                if(resultados.length == 0){
                    respuesta.send({busqueda_vacia:a_buscar,valor:usuarioID_o_correo});
                }
                else{
                    // usuarioID o correo concuerdan con un usario en la base de datos

                    // ahora sigue validar la contrasena con la base de datos

                    //bcryptjs.compare() es una funcion asincrona, por lo que debemos usar el await
                    let contraseña_correcta = await bcryptjs.compare(contraseña,resultados[0].contraseña);

                    if(contraseña_correcta == false){
                        respuesta.send({contraseña_incorrecta:true});
                    }else{

                        let ingreso;

                        if(usuarioID_valido == true){
                            ingreso = resultados[0].usuario_id;
                        } 
                        else {
                            ingreso = resultados[0].correo;
                        } 

                        let token = JsonWebToken.sign(
                            {user:ingreso},
                            process.env.JWT_SECRET,
                            {expiresIn:process.env.JWT_EXPIRATION}
                        );

                        // esto es un objeto
                        let galleta = {
                            // el expires es de tipo fecha
                            maxAge:10000,
                            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                            path:'/'
                        }


                        /*
                            la funcion cookie recibe 3 parametros:
                            ---> el nombre de la cookie
                            ---> La informacion del token ya sea en string o en formato JSON,
                                 dentro de la informacion podemos poner lo que queramos
                            ---> las opciones de la cookie
                        */
                        respuesta.cookie("Naruto_cookie",token,galleta);

                        respuesta.send({redirect:'/admin'});

                    }
                }
                }
                
            )
       }

       
       
   }
}





async function register(solicitud, respuesta){

    let repetido = false;
    let consulta ='';
    let parametros = [];


    let nombre = solicitud.body.nombre;
    let paterno = solicitud.body.paterno;
    let materno = solicitud.body.materno;
    let email = solicitud.body.email;
    let contraseña = solicitud.body.contraseña;

    if(!nombre || !paterno || !materno || !email || !contraseña){
        respuesta.send({campos_vacios:true})
    }
    else {

        // comprobar si el correo cumple con el regex
        let valido = regex_email.test(email);

        if(valido == false){
            respuesta.send({correo_valido:false});
        }
        else{
            // el correo valido si cumple con el regex, ahora sigue verificar si el correo no esta repetido

            consulta = 'select * from usuarios where correo = ?';
            parametros = [email];
            solicitud.database.query(consulta,parametros,(error,resultados)=>{
                if(error){
                    throw error;
                    return;
                }
                repetido = resultados.some((usuario)=>{
                    usuario.email == email
                })
            })

            if(repetido == true){
                respuesta.send({correo_repetido:true});
            }
            else{
                // perfecto, el correo no existe
                let salt =  await bcryptjs.genSalt(5);

                //clave cryptografica de la contraseña del usuario
                let hashPassword =  await bcryptjs.hash(contraseña,salt);  // la contraseña que vamos a guardar en nuestro usuario

                consulta = 'insert into usuarios values (null,?,?,?,?,?)';
                parametros = [nombre,paterno,materno,email,hashPassword];
                solicitud.database.query(consulta,parametros,(error,resultados)=>{
                    if(error){
                        throw error;
                        return;
                    }

                    /*
                      a diferencia de un select, que nos arroja un arreglo de objetos,
                      en un insert into, nos arroja un objeto, claro si nomas es asi, 
                      ya mas posterior dependiendo de si metemos triggers u otras cosas
                      sera diferente
                    */

                    let token_register = JsonWebToken.sign(
                        {user:resultados.insertId},
                        process.env.JWT_SECRET,
                        {expiresIn:process.env.JWT_EXPIRATION}
                    );

                    // esto es un objeto
                    let galleta_register = {
                        maxAge:10000,
                        // el expires es de tipo fecha
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        path:'/'

                        /*
                          cua
                        */
                    };

                    // nomre:string   value:string
                    respuesta.cookie("Naruto_cookie",token_register,galleta_register);

                    // GALLETA con la URL
                    let galleta2_DATA = {
                        
                    }

                    respuesta.send({redirect:'/admin'});
                })
            }
        }
        
    }
    
}



export const methods = {
    login,
    register
}