const textInput = document.getElementById('textInput');
const chat = document.getElementById('chat');

const templateChatMessage = (message, from) => `
  <div class="from-${from}">
    <div class="message-inner">
      <p>${message}</p>
    </div>
  </div>
`;

const insertTemplateInTheChat = (template) => {
    const div = document.createElement('div');
    div.innerHTML = template;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
};

const getWatsonMessageAndInsertTemplate = async (text = '') => {
    const uri = 'http://localhost:3000/conversation';

    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        const watsonText = data.text || 'No se pudo obtener una respuesta del asistente.';

        const watsonTemplate = templateChatMessage(watsonText, 'watson');
        insertTemplateInTheChat(watsonTemplate);

    } catch (error) {
        console.error('Error al obtener la respuesta de Watson:', error);
    }
};

textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && textInput.value) {
        const userText = textInput.value;

        const userTemplate = templateChatMessage(userText, 'user');
        insertTemplateInTheChat(userTemplate);

        getWatsonMessageAndInsertTemplate(userText);

        textInput.value = '';
    }
});

const initializeSession = async () => {
    const uri = 'http://localhost:3000/getsession';

    try {
        const response = await fetch(uri);
        const data = await response.json();
        console.log('Sesión creada:', data.sessionID);

    } catch (error) {
        console.error('Error al inicializar la sesión:', error);
    }
};

const showInitialMessage = () => {
    const initialMessage = "¿En qué puedo ayudarte?";
    const watsonTemplate = templateChatMessage(initialMessage, 'watson');
    insertTemplateInTheChat(watsonTemplate);
};

document.addEventListener('DOMContentLoaded', showInitialMessage);

initializeSession();
