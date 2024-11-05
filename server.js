const express = require('express');
var cors = require('cors');
const image = require('./controllers/image');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const { console } = require('inspector');
const signin = require('./controllers/signin');

const db = require('knex')({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  });

app.use(cors());
app.use(express.json()); 

const PORT = process.env.PORT;
app.get('/', (req,res) =>{
    res.json(db.users);
})

app.post('/signin', signin.handleSignin(db, bcrypt))

app.post('/register', (req,res) => {
    const {email,name,password} = req.body;
    
    
    // Load hash from your password DB.
    var hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            }).then(user =>{
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    
    .catch(err=> res.status(400).json("Unable to Register"));
})

app.get('/profile/:id',(req,res) =>{
    const {id} = req.params;
    db.select('*').from('users')
    .where({id})
    .then(user=>{
        if(user.length){
            res.json(user[0]);
        }else{
            res.status(400).json('Not Found');
        }
    })
    .catch(err => res.status(400).json('Error Getting User'));
})
app.put('/image', (req, res) => { image.handleImage(req, res, db)})
app.post("/imageurl", async function(req, res){  
    var data = await image.handleApiCall(req);
    console.log(data);
    res.json(data);
 })



app.listen(PORT, ()=>{
    console.log(PORT);
    console.log("app is running on ${PORT}");
});

