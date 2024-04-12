import mysql from'mysql';
import {config} from 'dotenv';


config();


const connection = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    database:process.env.DATABASE,
    password:process.env.PASSWORD
})

connection.connect(function(error){
    if(error)
       throw error;
    else
        console.log("Conexion exitosa");
})


export default connection;
