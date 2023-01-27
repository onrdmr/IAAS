const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const events = []

app.post('/events', async (req, res) => {
    const event = req.body;

    events.push(event)

    console.log("DEBUG LOG : event bus distribute event")

    // posts event
    axios.post('http://post-clusterip-srv:4000/events', event).catch((err)=> {
        console.log("posts service event req", err)
    })
    // comments event
    axios.post('http://comments-srv:4001/events', event).catch((err)=> {
        console.log("comments service event req", err)
    })
    // query service
    axios.post('http://query-srv:4002/events', event).catch((err)=> {
        console.log("query service event req", err)
    })
    // moderatiion service
    axios.post('http://moderation-srv:4003/events', event).catch((err)=> {
        console.log("moderation service event req", err)
    })
    
    res.send({ status: 'OK' })

})

app.get('/events', (req,res)=> {
    console.log("DEBUG LOG : event bus event retrievng by another service.")
    res.send(events)
})

app.listen(4005, ()=> {
    console.log("Listening 4005 : EventBus")
})