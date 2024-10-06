const express = require('express');
var cors = require('cors');
const image = require('./controllers/image');
const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req,res) =>{
    console.log("we are at the root");
})

app.post("/imageurl", async function(req, res){  
    var data = await image.handleApiCall(req);
    console.log(data);
    res.json(data);
 })

app.listen(3000, ()=>{
    console.log("app is running on 3000");
});

