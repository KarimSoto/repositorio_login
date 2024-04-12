document.getElementById("form-login").addEventListener("submit", async (evento)=>{
    evento.preventDefault();

    const respuesta = await fetch('http://localhost:3000/api/login',{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({
            user_or_email: evento.target.children.usuario.value,
            password: evento.target.children.contraseña.value
        })
    })


    if(!respuesta.ok)
       return;

    const respuestaJson = await respuesta.json();

    if(respuestaJson.campos_vacios){
        let vacios = document.createElement('div');
        vacios.textContent ='No ingresaste todos los campos';
        vacios.style.background = "red";
        document.getElementById('errores').appendChild(vacios);
    }

    if(respuestaJson.campos_incorrectos){
        let regex_false = document.createElement('div');
        regex_false.textContent = 'No estas ingresando un ususario o un correo valido';
        regex_false.style.background = "orange";
        document.getElementById('errores').appendChild(regex_false);
    }

    if(respuestaJson.busqueda_vacia){
        let no_coincidencia = document.createElement('div');

        if(respuestaJson.busqueda_vacia == "correo")
            no_coincidencia.textContent = `No existe el correo ${respuestaJson.valor}`;
        else
            no_coincidencia.textContent = `No existe el usuario ${respuestaJson.valor}`;
        
        no_coincidencia.style.background = "yellow";
        no_coincidencia.style.color = "black";
        document.getElementById('errores').appendChild(no_coincidencia);
    }

    if(respuestaJson.contraseña_incorrecta){
        const contraseña_err = document.createElement('div');
        contraseña_err.textContent = 'No ingresaste la contrasena correcta';
        contraseña_err.style.background = "#DFFF00";
        contraseña_err.style.color = "black";
        document.getElementById('errores').appendChild(contraseña_err);
    }

    if(respuestaJson.redirect){
        window.location.href = respuestaJson.redirect;
    }

})