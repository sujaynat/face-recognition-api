const express = require('express');
var cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const image = require('./controllers/image');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const { console } = require('inspector');
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

// Test endpoint for Supabase connection
app.get('/test-db', async (req, res) => {
    try {
        // Try to get the users table info
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        res.json({ 
            success: true, 
            message: 'Successfully connected to Supabase',
            data: data
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to connect to database',
            error: err.message 
        });
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.get('/', (req,res) =>{
    res.json('Success');
})

app.post('/signin', (req, res) => { signin.handleSignin(req, res, supabase, bcrypt) })

app.post('/register', (req, res) => { register.handleRegister(req, res, supabase, bcrypt) })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, supabase)})

app.put('/image', (req, res) => { image.handleImage(req, res, supabase)})

app.post("/imageurl", async function(req, res){  
    try {
        var data = await image.handleApiCall(req);
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error in imageurl endpoint:', error);
        res.status(500).json({ error: error.message });
    }
})

app.listen(PORT, ()=>{
    console.log(`app is running on port ${PORT}`);
});

