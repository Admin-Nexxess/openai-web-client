require('dotenv').config();
const APP_PORT = process.env.NODEPORT || 3000;

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

app.post('/chat', async (req, res) => {
    const userInput = req.body.message;
    const apiKey = 'YOUR_OPENAI_API_KEY';

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: userInput,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].text });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error connecting to OpenAI API');
    }
});

app.listen(APP_PORT, () => {
    console.log(`Server is running at http://localhost:${APP_PORT}`);
});
