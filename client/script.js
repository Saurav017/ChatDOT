import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');


let loadInterval;


// loader function
function loader(element)  {
  element.textContent =  '' ;

  loadInterval =  setInterval(() =>  {

    element.textContent +=  '.' ;

    // if the loader has 3 dots, clear the element
    if(element.textContent.length >  3 ) {
      element.textContent =  '' ;
    }
  }, 300)
}

// type text function
function typeText(element, text)  {
  let index = 0;

  // adding text word by word
  const typeInterval = setInterval(() =>  {
    if(index < text.length)  {
      element.innerHTML += text.charAt(index);
      // element.textContent += text[index];
      index++;
    } else{
      clearInterval(typeInterval);
    }
},20)

}

// generating unique id for each question
function generateUniqueID() {

  const timeStamp= Date.now();
  const random = Math.random();
  const hexaDecimalString = random.toString(16);

  return `id-${timeStamp}-${hexaDecimalString}`;
}

// creating a chat stripe
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}


// handling form submission
const handleSubmit = async (event) => {
  event.preventDefault();

  const data = new FormData(form);

  // generating user chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // clearing the form
  form.reset();

  // generating the bot chat stripe
  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, '' , uniqueId);

  // putting the message in the view in the window
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document .getElementById(uniqueId);

  // loader for the messageDiv
  loader(messageDiv);


  // fetch data from the server

  const response = await fetch('https://chatdot.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML =  '' ;
  

  if(response.ok) {
    const data = await response.json();
    console.log(data);
    // parsing the data in order to get it in the form of object
    const parsedData = data.result.trim();

    // typing the message
    typeText(messageDiv, parsedData);
  } else{
    //  if error
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong"
    alert(err);

  }
}


// handling form submission
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup',(e) => {
  if(e.keyCode === 13) {
    handleSubmit(e);
  }
})