require('dotenv').config();
const APP_PORT = process.env.NODEPORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
// const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (request, response, next) {
    response.sendFile('./views/index.html', { root: __dirname });
  });

console.log ("OPENAI_API_KEY", OPENAI_API_KEY);

app.post('/webhook', async (req, res) => {
    const user_input = req.body.message;

    try {
        console.log("Received a request: ", req.body);

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo-0301',
            messages: [{ role: 'user', content: user_input }]
        }, {
            headers: {
                'Authorization': `Bearer ` + OPENAI_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log("OpenAI response: ", response.data.choices[0].message.content);

        res.status(200).json({"response": response.data.choices[0].message.content});
    } catch (error) {
        console.error("Error communicating with OpenAI: ", error.response ? error.response.data : error.message);
        
        // Improved error response to client
        res.status(500).json({
            error: "Error communicating with OpenAI",
            details: error.response ? error.response.data : error.message
        });
    }
});



app.listen(APP_PORT, () => {
    console.log(`Server is running at http://localhost:${APP_PORT}`);
});
