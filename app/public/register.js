document.getElementById('register-form').addEventListener("submit", async(e)=>{
    e.preventDefault();
    console.log(e.target.children.nombre.value);

    const res = await fetch("http://localhost:3000/api/register",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({
            nombre:e.target.children.nombre.value,
            paterno:e.target.children.paterno.value,
            materno:e.target.children.materno.value,
            email:e.target.children.correo.value,
            contraseña:e.target.children.contraseña.value,
        })
    })

    if(!res.ok) 
        return;

    const resJson = await res.json();

    if(resJson.campos_vacios){
        const mensaje_c_v = document.createElement('div');
        mensaje_c_v.textContent ='No ingresaste todos los campos';
        mensaje_c_v.style.background = "yellow";
        document.getElementById('errores').appendChild(mensaje_c_v);
    }

    if(resJson.correo_valido){
        const mensaje_c_i = document.createElement('div');
        mensaje_c_i.textContent = 'El correo que ingresate no es valido';
        mensaje_c_i.style.background = "orange";
        document.getElementById('errores').appendChild(mensaje_c_i);
    }

    if(resJson.correo_repetido){
        const mensaje_c_e = document.createElement('div');
        mensaje_c_e.textContent ='El correo que ingresaste ya existe';
        mensaje_c_e.style.background = "red";
        document.getElementById('errores').appendChild(mensaje_c_e);
    }

    if(resJson.redirect){
        window.location.href = resJson.redirect;
    }

});