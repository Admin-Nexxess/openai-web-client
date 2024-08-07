const axios = require('axios');
const ZOHO_CREATOR_PROCESS_CHAT_API_KEY = process.env.ZOHO_CREATOR_PROCESS_CHAT_API_KEY;
const ZOHO_CREATOR_RETURN_REQUEST_API_KEY = process.env.ZOHO_CREATOR_RETURN_REQUEST_API_KEY;

async function processChat(prompt, response) {
    const data = {
        "method": "log_chat",
        "prompt": prompt,
        "response": {
            "choices": [
                {
                    "message": {
                        "content": response
                    }
                }
            ]
        }
    }
    try {
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

        // res.status(200).json({"response": response});
    } catch (error) {
        console.error("Error communicating with Zoho Creator: ", error.response ? error.response.data : error.message);
        // Improved error response to client
        response.status(500).json({
            error: "Error communicating with Zoho Creator",
            details: error.response ? error.response.data : error.message
        });
    }
}
module.exports = {
    processChat
};