const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const posts = {}

// QUICK EXAMPLE
// posts === {
//     'j123j42' : {
//         id: 'j123j42',
//         title : 'post title',
//         comments: [
//             { id: 'klj3l', content:'comment!'}
//         ]
//     },'j123j42' : {
//         id: 'j123j42',
//         title : 'post title',
//         comments: [
//             { id: 'klj3l', content:'comment!'}
//         ]
//     },'j123j42' : {
//         id: 'j123j42',
//         title : 'post title',
//         comments: [
//             { id: 'klj3l', content:'comment!'}
//         ]
//     }
// }

app.get('/posts', (req, res) => {
    res.send(posts)
})

const handleEvent = (type, data)=> {
    
    if (type === 'PostCreated') {
        const {id, title} = data;

        posts[id] = { id, title, comments: [] }
    }
    if(type === 'CommentCreated') {
        const { id, content, postId, status } = data

        const post = posts[postId]
        post.comments.push({ id , content , status })
    }

    if(type === 'CommentUpdated') {
        const {id, content, postId, status } = data

        const post = posts[postId]
        const comment = post.comments.find(comment => {
            return comment.id == id;
        })

        comment.status = status
        comment.content = content
        
    }

}

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type,data)


    res.send({})
})

app.listen(4002,async () => {
    console.log("listening on 4002 : QueryService")

    const res = await axios.get('http://event-bus-srv:4005/events').catch((err)=> {
        console.log(err)
    })

    for(let event of res.data) {
        console.log('Processing event : ', event.type)

        handleEvent(event.type, event.data)
    }
});