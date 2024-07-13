const ball = document.querySelector(".boton");
const items = document.querySelectorAll(
    ".sidebar,.container,header,.menu-icono,.modo-oscuro,.contenedor-peliculas,.interfaz-principal,.interfaz-cine,.interfaz-sala,th,td");
const itemsPeliculas = document.querySelectorAll('.item-peliculas');

// Añadir un evento de clic a cada elemento
itemsPeliculas.forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('.contenido').style.display = 'none';
        // Mostrar el div 'inicio-peliculas'
        document.getElementById('interfaz-principal').style.display = 'block';
    });
});

// Seleccionar el ícono del ticket
const ticketIcon = document.querySelector('.fa-ticket');

// Agregar evento de clic al ícono
ticketIcon.addEventListener('click', () => {
    // Ocultar el div 'contenido'
    document.querySelector('.contenido').style.display = 'none';
    
    // Mostrar el div 'interfaz-principal'
    document.getElementById('interfaz-principal').style.display = 'block';
});

const ticketIcona = document.querySelector('.fa-house');

// Agregar evento de clic al ícono
ticketIcona.addEventListener('click', () => {
    // Ocultar el div 'contenido'
    document.querySelector('.contenido').style.display = 'block';
    
    // Mostrar el div 'interfaz-principal'
    document.getElementById('interfaz-principal').style.display = 'none';
    document.getElementById('interfaz-cine').style.display = 'none';
    document.getElementById('interfaz-sala').style.display = 'none';
});