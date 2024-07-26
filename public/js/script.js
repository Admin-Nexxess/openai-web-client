document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;
    console.log ('userInput', userInput);
    document.getElementById('user-input').value = '';


    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        console.log ('data.response', data.response);
        const chatBox = document.getElementById('chat-box');
        const userMessage = document.createElement('div');
        userMessage.textContent = 'You: ' + userInput;
        chatBox.appendChild(userMessage);

        const botMessage = document.createElement('div');
        botMessage.textContent = 'Bot: ' + data.response;
        chatBox.appendChild(botMessage);

        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error('Error:', error));
});
