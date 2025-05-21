const clarifai = require('clarifai');
const { response } = require('express');

const baseUrl = "https://api.clarifai.com/v2/models/";

const getClarifaiRequestBody = (imageUrl) =>{
    // Your PAT (Personal Access Token) can be found in the Account's Security section
    const PAT = process.env.CLARIFAI_PAT;
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = process.env.CLARIFAI_USER_ID;
    const APP_ID = process.env.CLARIFAI_APP_ID;
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

const handleApiCall = async function (req) { 
    if (!req.body.input) {
        throw new Error('No URL provided');
    }

    const requestOptions = getClarifaiRequestBody(req.body.input);
    const res = await fetch(baseUrl + 'face-detection' + "/outputs", requestOptions);
    const data = await res.json();

    // Check if we have a valid response with the structure frontend expects
    if (!data || !data.outputs || !data.outputs[0] || !data.outputs[0].data) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid API response structure');
    }

    // Check if we have any faces
    if (!data.outputs[0].data.regions) {
        throw new Error('No faces detected in the image');
    }

    return data;
}

const handleImage = async (req, res, supabase) => {
    const { id } = req.body;
    try {
        // First get current entries
        const { data: user, error: selectError } = await supabase
            .from('users')
            .select('entries')
            .eq('id', id)
            .single();

        if (selectError) throw selectError;

        // Increment entries
        const newEntries = (user.entries || 0) + 1;

        // Update with new value
        const { data, error } = await supabase
            .from('users')
            .update({ entries: newEntries })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data.entries);
    } catch (err) {
        console.error('Error updating entries:', err);
        res.status(400).json('unable to get entries');
    }
}

module.exports = {
    handleApiCall,
    handleImage
}



