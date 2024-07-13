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
      name: "Soporte**1",
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
  $usersList.innerHTML = '';
  users.forEach((user) => {
      
      let ModUser = user.name.split('**');
   
      if(ModUser[1] ==  "0" ){
        const $li = document.createElement('li');
        $li.appendChild(document.createTextNode(ModUser[0]));
        $li.setAttribute("value", user.id); // added line
        $usersList.appendChild($li);      
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

  console.log($usersList.firstElementChild.getAttribute('value'));
  
  const message = $messageInput.value;
  $messageInput.value = '';

  socket.emit('send-message', message, $usersList.firstElementChild.getAttribute('value'));

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
  $onlineStatus.classList.add('hidden');
  $offlineStatus.classList.remove('hidden');
  localStorage.removeItem('name');
  socket.close();
}); 



$EndChatBtn.addEventListener('click', (evt) => {
 
  socket.emit('send-message', "**END**", $usersList.firstElementChild.getAttribute('value')); // agregar ID del usuario al q se le envia el mensaje
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