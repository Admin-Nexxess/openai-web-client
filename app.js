require('dotenv').config();
const APP_PORT = process.env.NODEPORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const cors = require('cors');
// const ZOHO_CREATOR_PROCESS_CHAT_API_KEY = process.env.ZOHO_CREATOR_PROCESS_CHAT_API_KEY;
// const ZOHO_CREATOR_RETURN_REQUEST_API_KEY = process.env.ZOHO_CREATOR_RETURN_REQUEST_API_KEY;

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const showdown = require('showdown');
const zoho_creator = require('./functions/zoho_creator.js')
const app = express();
// const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (request, response, next) {
    response.sendFile('./views/index.html', { root: __dirname });
    // response.sendFile('./views/chat.html', { root: __dirname });
  });


console.log ("OPENAI_API_KEY", OPENAI_API_KEY);

app.post('/webhook', async (req, res) => {
    const user_input = req.body.message;

    try {
        // console.log("Received a request: ", req.body);

        //             assistant: 'asst_bmwA8jaOqj0VTIXgtYmqlaj2', // Include your assistant ID here
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
        { role: 'user', content: user_input }]
        }, {
            headers: {
                'Authorization': `Bearer ` + OPENAI_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // console.log("OpenAI response: ", response.data.choices[0].message.content);
        response_message = response.data.choices[0].message.content;
        converter = new showdown.Converter();
        message_html = converter.makeHtml(response_message);
        res.status(200).json({"response": message_html});
        await zoho_creator.processChat (user_input, response);
    } catch (error) {
        console.error("Error communicating with OpenAI: ", error.response ? error.response.data : error.message);
        
        // Improved error response to client
        res.status(500).json({
            error: "Error communicating with OpenAI",
            details: error.response ? error.response.data : error.message
        });
    }
});

app.post('/chat', async (req, res) => {
    const user_input = req.body.message;

    try {
      const openai = axios.create({
        baseURL: 'https://api.openai.com/v1',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      const systemMessage = {
        role: 'system',
        content: system_prompts.Setup
      };
  
      const conversationHistory = [
        systemMessage,
      ];
  
      const newUserMessage = {
        role: 'user',
        content: user_input
      };
  
      conversationHistory.push(newUserMessage);
      console.log(":91 conversationHistory", conversationHistory)
  
      var full_response;
      async function getOpenAIResponse(messages) {
        const response = await openai.post('/chat/completions', {
          model: 'gpt-4',
          messages: messages
        });
        full_response = response;
        return response.data.choices[0].message.content;
      }
  
      const response_text = await getOpenAIResponse(conversationHistory);
      console.log('OpenAI response:', response_text);
      conversationHistory.push({ role: 'assistant', content: response_text });
      converter = new showdown.Converter();
      message_html = converter.makeHtml(response_text);
      res.status(200).json({"response": message_html});
      await zoho_creator.processChat (user_input, full_response);
    } catch (error) {
      console.error("Error communicating with OpenAI: ", error.response ? error.response.data : error.message);
      res.status(500).json({
        error: "Error communicating with OpenAI",
        details: error.response ? error.response.data : error.message
      });
    }
  });
  




app.listen(APP_PORT, () => {
    console.log(`Server is running at http://localhost:${APP_PORT}`);
});