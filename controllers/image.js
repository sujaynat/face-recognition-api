const clarifai = require('clarifai');
const { response } = require('express');


const baseUrl = "https://api.clarifai.com/v2/models/";

const getClarifaiRequestBody = (imageUrl) =>{
    // Your PAT (Personal Access Token) can be found in the Account's Security section
    const PAT = '<PAT>';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = '<USER_ID>';
    const APP_ID = '<APP_ID>';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const IMAGE_URL = imageUrl;

    
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                        // "base64": IMAGE_BYTES_STRING
                    }
                }
            }
        ]
    });
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    return requestOptions;  
    }

      
    const handleApiCall =  async function (req) { 
        const requestOptions =  getClarifaiRequestBody(req.body.input);
        const res = await fetch(baseUrl + 'face-detection' + "/outputs", requestOptions)
        const data = res.json();
        console.log(data);
        return data;

    }

    module.exports = {
        handleApiCall
    }



