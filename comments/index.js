
const express = require('express');
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express();
app.use(bodyParser.json())
app.use(cors())
const urlParser = bodyParser.json()


const commentsByPostId = {}

app.post('/posts/:id/comments', async (req,res) => {
    console.log("comments id post");
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body;
    console.log(req.body)

    const comments = commentsByPostId[req.params.id] || []
    // console.log(req.params.id , "and ",comments)

    comments.push({ id:commentId, content, status:'pending' })
    commentsByPostId[req.params.id] = comments

    axios.post("http://event-bus-srv:4005/events", {
        type: "CommentCreated",
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status:'pending'
        }
    }).catch((err)=>{
        console.log(err)
    })

    res.status(201).send(commentsByPostId)
})

app.get('/posts/:id/comments', (req,res) => {console.log("comments id get"); res.send(commentsByPostId[req.params.id] || []) })

app.post('/events', async (req, res) => {
    console.log('Event Received:', req.body.type)

    const { type, data } = req.body

    if( type === "CommentModerated" ) {
        const { postId, id, status, content } = data

        console.log("comment service status ", status)
        const comments = commentsByPostId[postId]

        const comment = comments.find((comment)=> {
            return comment.id === id;
        })

        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events', {
            type: "CommentUpdated",
            data: {
                id,
                status,
                postId,
                content
            }
        })
    }

    res.send({})
})

app.listen(4001, ()=> {
    console.log("Listening on 4001 : CommentService")
})