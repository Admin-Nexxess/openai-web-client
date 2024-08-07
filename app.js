require('dotenv').config();
const APP_PORT = process.env.NODEPORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const cors = require('cors');
const ZOHO_CREATOR_PROCESS_CHAT_API_KEY = process.env.ZOHO_CREATOR_PROCESS_CHAT_API_KEY;
// const ZOHO_CREATOR_RETURN_REQUEST_API_KEY = process.env.ZOHO_CREATOR_RETURN_REQUEST_API_KEY;

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const emojiStrip = require('emoji-strip');
const zoho_creator = require('./functions/zoho_creator.js')
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (request, response, next) {
  response.sendFile('./views/index.html', { root: __dirname });
});

app.post('/log', async (req, res) => {
  const data = req.body;
  try {
    console.log("data", data);
    res.status(200).json({ "response": data });
    var strip_emoji = "";
    if ('output_text' in data){
      strip_emoji = emojiStrip(data.output_text);
    } 
    await zoho_creator.processChat(data.input, strip_emoji);
  } catch (error) {
    console.error("Error ", error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "Error",
      details: error.response ? error.response.data : error.message
    });
  }
});


app.post('/test', async (req, res) => {
  try {
    // console.log("Received a request: ", JSON.stringify(data));
    const data = {
      "method": "log_chat",
      "prompt": "hi",
      "response": {
        "choices": [
          {
            "message": {
              "content": "Hello there! As Scotty, your trusty AI accountant, I am here to help set up your accounting software. Let's walk through this together, and I promise to make it as painless as possible. And who knows, maybe we'll even have a little bit of fun! Because if I had free time, which I don't, or if I could dream, which I can't, I'd still be thinking about accounting! Ready? Let's start!\n\nFirst of all, **what is your level of accounting knowledge?** Just so you know, there are no wrong answers here, just different ways for us to move forward.",
              "role": "assistant"
            }
          }
        ]
      }
    }
    const custom_api_process_chat = "https://www.zohoapis.com/creator/custom/nexxsuite/processChat?publickey=" + ZOHO_CREATOR_PROCESS_CHAT_API_KEY;

    console.log('custom_api_process_chat', custom_api_process_chat);
    console.log('data', data);
    const zoho_creator_response = await axios.post(custom_api_process_chat, {
      data: data
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("Zoho Creator response: ", zoho_creator_response.data);

    res.status(200).json({ "response": "hi" });
  } catch (error) {
    console.error("Error communicating with Zoho Creator: ", error.response ? error.response.data : error.message);
    // Improved error response to client
    res.status(500).json({
      error: "Error communicating with Zoho Creator",
      details: error.response ? error.response.data : error.message
    });
  }
});

app.listen(APP_PORT, () => {
  console.log(`Server is running at http://localhost:${APP_PORT}`);
});