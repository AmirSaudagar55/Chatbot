document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('chat-container');
  const userInput = document.getElementById('user-input');

  userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      sendMessage(userInput.value);
      userInput.value = '';
    }
  });

  function sendMessage(message) {
    // Append the user's message to the chat container
    appendMessage('You', message);
    
    fetch('/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: message })
    })
    .then(response => response.json())
    .then(data => {
      if (data.response === 'No answer found') {
        // If no answer found, prompt user to provide an answer
        replaceMessage('You', message, 'Chatbot', data.response);
        appendMessage('Chatbot', 'Please provide an answer:');
      } else {
        // Otherwise, display the response from the chatbot directly
        replaceMessage('You', message, 'Chatbot', data.response);
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  function replaceMessage(sender, oldMessage, newSender, newMessage) {
    // Find the message element containing the old message
    const messageElements = chatContainer.querySelectorAll('.mb-2');
    const lastMessageElement = messageElements[messageElements.length - 1];
    if (lastMessageElement.innerText.includes(oldMessage)) {
      // Replace the old message with the new message
      lastMessageElement.innerHTML = `<strong>${newSender}:</strong> ${newMessage}`;
    }
  }
    
  
  // Function to handle storing new answers
  function storeAnswer(question, answer) {
    fetch('/store-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question, answer })
    })
    .then(response => response.json())
    .then(data => {
      appendMessage('Chatbot', data.message);
    })
    .catch(error => console.error('Error:', error));
  }

  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('mb-2', 'px-2');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Function to handle user input for providing an answer
  function handleUserInputForAnswer() {
    userInput.removeEventListener('keydown', handleUserInputForAnswer);
    userInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        const answer = userInput.value;
        if (answer.trim() === '') {
          appendMessage('Chatbot', 'Please provide a valid answer.');
        } else {
          const question = chatContainer.lastElementChild.previousElementSibling.innerText.slice(8);
          storeAnswer(question, answer);
        }
        userInput.value = '';
        userInput.removeEventListener('keydown', handleUserInputForAnswer);
        userInput.addEventListener('keydown', handleUserInputForQuestion);
      }
    });
  }

  // Function to handle user input for asking a question
  function handleUserInputForQuestion() {
    userInput.removeEventListener('keydown', handleUserInputForQuestion);
    userInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        sendMessage(userInput.value);
        userInput.value = '';
      }
    });
  }

  // Initial event listener for user input
  userInput.addEventListener('keydown', handleUserInputForQuestion);
});
