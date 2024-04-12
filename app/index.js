import express from 'express';
import cookieParser from 'cookie-parser';
import {methods as authentication} from './controllers/authentication.controllers.js';
import {methods as authorization} from './middlewares/authorization.js';
import connection from './database.js';

    
// express
const app = express();
const puerto = 3000;
app.listen(puerto,()=>{
    console.log(`El servidor esta escuchando en el puerto ${puerto}`);
});

console.log('El mas GRANDEEEE')

import path from 'path';
import { fileURLToPath } from 'url';
const _dirname = path.dirname(fileURLToPath(import.meta.url));


// Configuracion
app.use(cookieParser());
app.use(express.static(_dirname + '/public'));
app.use(express.json());
app.use((req, res, next) => {
    req.database = connection;
    next();
});



//rutas
app.get('/', authorization.no_logeado, (solicitud,respuesta)=>{
    respuesta.sendFile(_dirname + '/pages/login.html')
})

app.get('/register', authorization.no_logeado, (solicitud,respuesta)=>{
    respuesta.sendFile(_dirname + '/pages/register.html')
})



app.get('/admin', authorization.logeado, (solicitud,respuesta)=>{
    respuesta.sendFile(_dirname + '/pages/admin/admin.html')
})



app.post('/api/register',authentication.register);
app.post('/api/login',authentication.login);