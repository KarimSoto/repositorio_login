document.getElementById('cerrar-sesion').addEventListener('click',()=>{

    // expirar la fecha de la cookie para que ya no exista
    document.cookie = "Naruto_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 

    // enviarlo al login
    document.location.href = '/';  
})