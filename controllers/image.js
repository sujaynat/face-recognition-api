const handleApiCall = async (req) => {
    console.log('Incoming request body:', req.body);

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

    console.log('Request payload to Clarifai:', raw);
    console.log('Environment variables present:', {
        hasUserId: !!process.env.CLARIFAI_USER_ID,
        hasAppId: !!process.env.CLARIFAI_APP_ID,
        hasPAT: !!process.env.CLARIFAI_PAT
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + process.env.CLARIFAI_PAT,
            'Content-Type': 'application/json'
        },
        body: raw
    };

    try {
        console.log('Sending request to Clarifai...');
        const response = await fetch(
            "https://api.clarifai.com/v2/models/a403429f2ddf4b49b307e318f00e528b/outputs",
            requestOptions
        );
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Raw response body:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('Parsed response:', result);
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            throw new Error('Invalid JSON response from Clarifai');
        }

        if (!response.ok) {
            console.error('Clarifai error details:', result);
            throw new Error(`Clarifai API error: ${response.status} ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('Error in handleApiCall:', error);
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



