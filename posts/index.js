const express = require('express');
const bodyParser = require('body-parser')
const axios = require("axios")
const { randomBytes } = require('crypto')
const cors  = require('cors')


const app = express();
app.use(bodyParser.json())
app.use(cors())
const posts = {};

app.get('/posts', (req,res) => {
    console.log("get post is entered.");
    res.send(posts)
})

app.post('/posts', async (req, res)=>{
    console.log("res")
    const id = randomBytes(4).toString('hex')
    const { title } = req.body;
    console.log(req.body)
    console.log(title)
    
    posts[id] = {
        id, title
    };

    await axios.post('http://event-bus-srv:4005/events', {
        type: "PostCreated",
        data: {
            id, title
        }
    }).catch((err)=>{
        console.log("error occured", err)
    })


    res.status(201).send(posts[id])
}) 

app.post('/events', (req, res) => {
    console.log('Event Received:', req.body.type)

    res.send({})
})

app.get('/get', (req,res) => {})

app.listen(4000, () => {
    console.log("v20")
    console.log('Listening on 4000 : PostService')
})

