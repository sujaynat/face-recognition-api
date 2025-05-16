const handleApiCall = async (req) => {
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": process.env.CLARIFAI_USER_ID,
            "app_id": process.env.CLARIFAI_APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": req.body.input
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + process.env.CLARIFAI_PAT
        },
        body: raw
    };

    try {
        const response = await fetch(
            "https://api.clarifai.com/v2/models/face-detection/outputs",
            requestOptions
        );
        const result = await response.json();
        
        // Check if we have a valid response
        if (result.status.code !== 10000) {
            throw new Error('API call failed: ' + result.status.description);
        }

        // Check if we have any faces
        if (!result.outputs?.[0]?.data?.regions) {
            throw new Error('No faces detected in the image');
        }

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
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
    handleImage,
    handleApiCall
}



