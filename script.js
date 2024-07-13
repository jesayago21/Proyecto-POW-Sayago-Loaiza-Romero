const apiToken = "https://cinexunidos-production.up.railway.app"
let idCine = null;
let idSala = null;
let selectedShow = null;
let textosSalas = null;


function getCines() {
    fetch(`${apiToken}/theatres`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify()
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received from API:', data); // Verificar los datos recibidos
        const contenedorCines = document.getElementById("cines-disponibles");

        if (contenedorCines) {
            contenedorCines.innerHTML = ""; // Clear container content

            for (let i = 0; i < data.length; i++) {
                const cine = data[i];

                const card = document.createElement("div");
                card.classList.add("card", "cine-card"); // Add class for styling
                const contenedorImgCine = document.createElement("div");
                contenedorImgCine.classList.add("contenedor-img-cine");

                const cineImage = document.createElement("img");
                cineImage.classList.add("cine-image");
                cineImage.src = `${apiToken}/${cine.images[0]}`;
                contenedorImgCine.appendChild(cineImage);

                card.appendChild(contenedorImgCine);

                const cineName = document.createElement("h3");
                cineName.textContent = cine.name;
                card.appendChild(cineName);

                card.addEventListener("click", function() {
                    document.getElementById("sala-seleccionada").innerHTML = ""; // Limpiar el contenedor de salas
                    const textosSalas = document.querySelectorAll(".textos-salas");
                    textosSalas.forEach(texto => {
                        texto.style.display = "none";
                    });
                    const interfazCine = document.querySelectorAll(".interfaz-cine");
                    interfazCine.forEach(interfaz => {  
                        interfaz.style.display = "block";
                    });
                    const cineSeleccionado = document.getElementById("cine-seleccionado");
                    cineSeleccionado.textContent = cine.name;
                    idCine = cine.id;
                    getCineEspecifico(cine.id);
                });

                contenedorCines.appendChild(card);
            }
        } else {
            console.error('El contenedor con ID "cines-disponibles" no existe en el DOM.');
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}
function getCineEspecifico(idCine){
    fetch(`${apiToken}/theatres/${idCine}/auditoriums`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(respuesta => {
        console.log('Data received from API:', respuesta);
        const contenedorSalas = document.getElementById("salas-disponibles");

        if (contenedorSalas) {
            document.getElementById("asientos-disponibles").innerHTML = ""; // Limpiar el contenedor de asientos
            contenedorSalas.innerHTML = ""; 
            const tablaSalas = document.createElement("table");
            tablaSalas.classList.add("tabla", "tabla-salas"); // Add class for styling
            tablaSalas.innerHTML = ""; // Clear table content
            const headerRow = document.createElement("tr");
            const headerId = document.createElement("th");
            headerId.textContent = "Numero de la sala";
            headerRow.appendChild(headerId);

            const headerId2 = document.createElement("th");
            headerId2.textContent = "Capacidad";
            headerRow.appendChild(headerId2);


            tablaSalas.appendChild(headerRow);

            for (let i = 0; i < respuesta.length; i++) {
                const sala = respuesta[i];
                const row = document.createElement("tr");
                const salaId = document.createElement("td");

                const capacity = document.createElement("td");
                capacity.textContent = sala.capacity;
                salaId.textContent = sala.name;

                row.appendChild(salaId);
                row.appendChild(capacity);
                tablaSalas.appendChild(row);
                
                console.log(sala.id);
                console.log(sala.showtimes);
                salaId.addEventListener("click", function() {
                    const salaSeleccionada = document.getElementById("sala-seleccionada");
                    salaSeleccionada.textContent = sala.name;
                    textosSalas = document.querySelectorAll(".textos-salas");
                    textosSalas.forEach(texto => {
                        texto.style.display = "block";
                    });
                    const interfazSala = document.querySelectorAll(".interfaz-sala");
                    interfazSala.forEach(interfaz => {  
                        interfaz.style.display = "block";
                    });
                    fetch(`${apiToken}/theatres/${idCine}/auditoriums/${sala.id}`)
                        .then(response => response.json())
                        .then(data => {
                            console.log(data.layout);
                            idSala = sala.id;
                            getShowtimes(idCine, sala.id);
                        })
                        .catch(error => {
                            console.error('Error fetching seat data:', error);
                        });
                });
            }
            

            contenedorSalas.appendChild(tablaSalas); // Asegurarse de agregar la tabla al contenedor
        } else {
            console.error('El contenedor con ID "cines-disponibles" no existe en el DOM.');
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

async function reservarAsiento(fila, index) {
    const seat = `${fila}${index}`; // Formato del asiento, por ejemplo "A1"

    return fetch(`${apiToken}/theatres/${idCine}/auditoriums/${idSala}/showtimes/${selectedShow}/reserve`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seat: seat })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Reserva exitosa:', data);
        // Aquí puedes actualizar la UI o manejar la respuesta de la reserva
    })
    .catch(error => {
        console.error('Error en la reserva:', error);
    });
}

async function borrarReserva(fila, index) {
    const seat = `${fila}${index}`; // Formato del asiento, por ejemplo "A1"

    return fetch(`${apiToken}/theatres/${idCine}/auditoriums/${idSala}/showtimes/${selectedShow}/reserve`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seat: seat })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Reserva eliminada:', data);
    })
}

function actualizarReserva(seats) { 
    console.log('Actualizando reservas de asientos.');
    const eventSource = new EventSource(`${apiToken}/theatres/${idCine}/auditoriums/${idSala}/showtimes/${selectedShow}/reservation-updates`);
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Actualización de reserva:', data);
        if (data.result === "SEAT_RESERVED") {
            actualizarAsientos(seats, data.seat, "reserved");
        } else if (data.result === "SEAT_RELEASED") {
            actualizarAsientos(seats, data.seat, "available"); 
        }
    };
}

async function actualizarAsientos(seats, idAsiento, accion) {
    console.log(idAsiento);
    const asientoElement = document.getElementById(`boton-${idAsiento}`);
    const classList = asientoElement.classList;

    switch (accion) {
        case 'available':
            classList.remove('reserved', 'occupied'); // Eliminar clases 'reservado' y 'ocupado'
            classList.add('available'); // Añadir clase 'disponible'
            break;
        case 'occupied':
            classList.remove('available', 'reserved'); // Eliminar clases 'disponible' y 'reservado'
            classList.add('occupied'); // Añadir clase 'ocupado'
            break;
        case 'reserved':
            classList.remove('available', 'occupied'); // Eliminar clases 'disponible' y 'ocupado'
            classList.add('reserved'); // Añadir clase 'reservado'
            break;
        default:
            // Acciones para un asiento con una clase no manejada
            console.warn('Acción de asiento no reconocida:', accion);
    }

    // Actualizar el estado en el objeto seats
    Object.keys(seats).forEach((fila) => {
        const asientosFila = seats[fila];
        Object.keys(asientosFila).forEach((asiento) => {
            if (`boton-${fila}${asiento}` === idAsiento) {
                if (accion === 'disponible') {
                    seats[fila][asiento] = 0; // Cambiar el estado a 0 para disponible
                } else if (accion === 'ocupado') {
                    seats[fila][asiento] = 1; // Cambiar el estado a 1 para ocupado
                } else if (accion === 'reservado') {
                    seats[fila][asiento] = 2; // Cambiar el estado a 2 para reservado
                }
                console.log(`Asiento ${idAsiento} ha sido actualizado a ${accion}.`);
            }
        });
    });
}

async function crearMatrizAsientos(seats) {
    const contenedorAsientos = document.getElementById("asientos-disponibles");
    contenedorAsientos.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos asientos

    Object.keys(seats).forEach(fila => {
        const filaDiv = document.createElement("div");
        filaDiv.classList.add("fila-asientos");
    
        asientos = seats[fila];
        asientos.forEach((asiento, index) => {
            const asientoDiv = document.createElement("div");
            asientoDiv.classList.add("asiento");
            if (asiento === -1) {
                asientoDiv.innerHTML = '&nbsp;'; // Espacio en blanco
            } else if (asiento === 0) {
                const boton = document.createElement("button");
                boton.classList.add("available");
                boton.id = `boton-${fila}${index}`; // Asignar identificador único
                boton.innerHTML = '<i class="fa-solid fa-couch"></i>'; // Mostrar el icono del asiento en el botón
                boton.addEventListener("click", async function() {
                    try {
                        if (boton.classList.contains('available')) {
                            boton.classList.remove('available');
                            boton.classList.add('reserved');
                            seats[fila][index] = 1;
                            console.log(`Asiento seleccionado: ${fila}-${index}`);
                            await reservarAsiento(fila, index);
                        } else if (boton.classList.contains('reserved')) {
                            boton.classList.remove('reserved');
                            boton.classList.add('available');
                            seats[fila][index] = 0;
                            await borrarReserva(fila, index);
                        }
                    } catch (error) {
                        console.error('Error en el evento click del botón:', error);
                    }
                });
                asientoDiv.appendChild(boton);
            } else if (asiento === 1) {
                const botonReserva = document.createElement("button");
                botonReserva.classList.add("occupied");
                botonReserva.id = `boton-${fila}${index}`; // Asignar identificador único
                botonReserva.innerHTML = '<i class="fa-solid fa-couch"></i>';
                asientoDiv.appendChild(botonReserva);
            } else {
                const botonOcupado = document.createElement("button");
                botonOcupado.classList.add("reserved");
                botonOcupado.id = `boton-${fila}${index}`; // Asignar identificador único
                botonOcupado.innerHTML = '<i class="fa-solid fa-couch"></i>'; 
                asientoDiv.appendChild(botonOcupado);
                botonOcupado.disabled = true;
            }
    
            filaDiv.appendChild(asientoDiv);
        });
    
        contenedorAsientos.appendChild(filaDiv);
    });
    actualizarReserva(seats);
}


function getShowtimes(idCine, idSala) {
    const showtimesContainer = document.getElementById('showtimes-container');
    showtimesContainer.innerHTML = ''; // Limpiar el contenedor de cartas

    fetch(`${apiToken}/theatres/${idCine}/auditoriums/${idSala}/showtimes`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(show => {
            // Crear la carta
            const showCard = document.createElement('div');
            showCard.classList.add('show-card');

            const imageContenedor = document.createElement('div');
            imageContenedor.classList.add('image-contenedor');
            const image = document.createElement('img');
            image.classList.add('movie-poster');
            image.src = `${apiToken}/${show.movie.poster}`;
            imageContenedor.appendChild(image);
            showCard.appendChild(imageContenedor);

            // Agregar el título de la película
            const movieTitle = document.createElement('h4');
            movieTitle.innerHTML = `<strong>${show.movie.name}</strong>`;
            showCard.appendChild(movieTitle);

            // Agregar la hora de la función
            const showtime = document.createElement('p');
            showtime.innerHTML = `<strong>Hora:</strong> ${show.startTime}`;
            showCard.appendChild(showtime);

            // Agregar la duración de la película
            const duration = document.createElement('p');
            duration.innerHTML = `<strong>Duración:</strong> ${show.movie.runningTime} minutos`;
            showCard.appendChild(duration);

            const valoracion = document.createElement('p');
            valoracion.innerHTML = `<strong>Clasificación:</strong> ${show.movie.rating}`;
            showCard.appendChild(valoracion);

            // Agregar la carta al contenedor
            showtimesContainer.appendChild(showCard);

            // Agregar evento de click a la carta
            showCard.addEventListener('click', () => {
                selectedShow = show.id;
                crearFuncion(selectedShow);
            });
        });
    })
    .catch(error => console.error(error));
}

function crearFuncion(selectedShow) {
    fetch(`${apiToken}/theatres/${idCine}/auditoriums/${idSala}/showtimes/${selectedShow}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        crearMatrizAsientos(data.seats);
    })
    .catch(error => console.error(error));

}
function mostrarLogin(){
    document.getElementById("login").style.display = "block";
}
function cerrarLogin(){
    document.getElementById("login").style.display = "none";
}

function iniciarSesion(){
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    if (user === "admin" && password === "admin123") {
        document.getElementById("login").style.display = "none";
        location.href = "Servidor.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}
