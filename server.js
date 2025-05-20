const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const image = require('./controllers/image');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const signin = require('./controllers/signin');
const register = require('./controllers/register');
const profile = require('./controllers/profile');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.get('/', (req, res) => {
    res.json({
        message: 'Face Recognition API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.post('/signin', async (req, res) => {
    try {
        await signin.handleSignin(req, res, supabase, bcrypt);
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Error during signin' });
    }
});

app.post('/register', async (req, res) => {
    try {
        await register.handleRegister(req, res, supabase, bcrypt);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error during registration' });
    }
});

app.get('/profile/:id', async (req, res) => {
    try {
        await profile.handleProfileGet(req, res, supabase);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Error getting profile' });
    }
});

app.put('/image', async (req, res) => {
    try {
        await image.handleImage(req, res, supabase);
    } catch (error) {
        console.error('Image update error:', error);
        res.status(500).json({ error: 'Error updating image count' });
    }
});

app.post("/imageurl", async (req, res) => {  
    try {
        const data = await image.handleApiCall(req);
        res.json(data);
    } catch (error) {
        console.error('Error in imageurl endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

