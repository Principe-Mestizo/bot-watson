const express = require('express');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('./public'))

const port = 3000;

//  ? Configuración del cliente de Watson Assistant  llamamos a nuestras variables de entorno
const assistant = new AssistantV2({
    version: process.env.WATSON_VERSION,
    authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY,
    }),
    serviceUrl: process.env.WATSON_URL,
});





let sessionID = null;  // Inicializa sessionID como null ya que no existe la sesion 

// todo: Creamos una nueva sesión
app.get('/getsession', (req, res) => {
    assistant.createSession({
        assistantId: process.env.WATSON_ENVIRONMENT_ID
    })
        .then(createSessionResult => {
            sessionID = createSessionResult.result.session_id;
            console.log('Session ID creada:', sessionID);
            res.status(200).json({ sessionID });
        })
        .catch(createSessionError => {
            console.error('Error al crear la sesión:', createSessionError);
            res.status(500).json({ error: 'No se pudo crear la sesión' });
        });
});
// Todo: Middleware para verificar si la sesión está creada
const checkSession = (req, res, next) => {
    if (!sessionID) {
        return res.status(400).json({ message: 'Sesión no iniciada. Llama a /getsession primero.' });
    }
    next();
};




// Todo: Ruta para enviar un mensaje a Watson Assistant
app.post('/conversation', checkSession, (req, res) => {
    const { text } = req.body;  // Texto del mensaje del usuario

    // ?Envía el mensaje a Watson Assistant
    assistant.message({
        assistantId: process.env.WATSON_ENVIRONMENT_ID,
        sessionId: sessionID,
        input: {
            'message_type': 'text',
            'text': text,
        }
    })
        .then(messageResponse => {
            const response = messageResponse.result.output;
            res.json({
                text: response.generic[0]?.text || 'Sin respuesta del asistente.',
                intents: response.intents,
                entities: response.entities
            });
        })
        .catch(err => {
            console.error('Error en la conversación:', err);
            res.status(500).json({ error: 'No se pudo enviar el mensaje a Watson Assistant' });
        });
});

app.listen(port, () => console.log(`Corriendo en el puerto ${port}`));


// PREGUNTA acpetada = 'Connect to agent'