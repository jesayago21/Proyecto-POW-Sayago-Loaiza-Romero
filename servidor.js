//const socket = io('https://cinexunidos-production.up.railway.app');
const username = "Soporte";
const $onlineStatus = document.querySelector('#status-online');
const $offlineStatus = document.querySelector('#status-offline');
const $username = document.querySelector('#username');
const $lastSeen = document.querySelector('#last-seen');
const $chatForm = document.querySelector('form');
const $messageInput = document.querySelector('input');
const $chatElement = document.querySelector('#chat');
const $usersList = document.querySelector('#users-list');
const $disconnectBtn = document.querySelector('#disconnect-btn');
const $EndChatBtn = document.getElementById('EndChat-btn'); 



let $tipoUser = "";
const socket = io('https://cinexunidos-production.up.railway.app',{
  auth: {
      token: 'ABC-4561', // Se debería sustituir por un token real...
      name: "soporte**1",
  },
});

socket.on('connect', () => {
  $onlineStatus.classList.remove('hidden');
  $offlineStatus.classList.add('hidden');

  $username.textContent = username;
  $lastSeen.innerHTML = getLastSeen();

  console.log('Connected');
});

const renderUsers = (users) => {
  let listaUsuarios = [];
  $usersList.innerHTML = '';
  users.forEach((user) => {
      const $li = document.createElement('li');
      let ModUser = user.name.split('**');
   
      if(ModUser[1] ==  "0" ){
      $li.textContent = ModUser[0];
      $usersList.appendChild($li);
      listaUsuarios.push(ModUser[0],user.id)
      console.log(listaUsuarios);
    }
  });
};
const renderMessage = (payload) => {

  let ModUser = payload.name.split('**');  
      if(ModUser[1] ==  "0" || ModUser[1] ==  "1" ){
  const { id, message, name } = payload;
console.log(payload);
$tipoUser = message[1];
console.log($tipoUser);

  const $divElement = document.createElement('div');
  $divElement.classList.add('message');

  if (id !== socket.id) {
      $divElement.classList.add('incoming');
  }
  
  $divElement.innerHTML = `<small>${ModUser[0]}</small><p>${message[0]}</p>`;
  $chatElement.appendChild($divElement);
}
  // Scroll al final de los mensajes...
  $chatElement.scrollTop = $chatElement.scrollHeight;
};

$chatForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const message = $messageInput.value;
  $messageInput.value = '';

  socket.emit('send-message', message,"1");
});

socket.on('disconnect', () => {
  $onlineStatus.classList.add('hidden');
  $offlineStatus.classList.remove('hidden');
  console.log('Disconnected');
});


socket.on('online-users', renderUsers);

socket.on('new-message', renderMessage);

$disconnectBtn.addEventListener('click', (evt) => {
  evt.preventDefault();
  localStorage.removeItem('name');
  socket.close();
  window.location.replace('websockets.html');
}); 



$EndChatBtn.addEventListener('click', (evt) => {
 
  socket.emit('send-message', "**END**","1"); // agregar ID del usuario al q se le envia el mensaje
  $usersList.removeChild($usersList.firstElementChild);
}); 

function getLastSeen() {
  // Obtener la fecha actual
  const now = new Date();

  // Convertir a huso horario de Venezuela (GMT-4)
  const venezuelaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));

  // Formatear la fecha
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  const formattedTime = venezuelaTime.toLocaleTimeString('es-VE', options);

  return `<small>Hoy a las ${formattedTime}</small>`;
}