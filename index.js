const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svjmy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 9000



app.get('/', (req, res) => {
    res.send('Hello World!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminCollection = client.db("creativeAgency").collection("admin");
    const feedbackCollection = client.db("creativeAgency").collection("feedback");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const servicesCollection = client.db("creativeAgency").collection("services");
    console.log('db connected')


    //add all orders
    app.post('/addOrders', (req, res) => {
        const orders = req.body;
        orderCollection.insertOne(orders)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })


    //all customer order in admin
    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })

    })

    //customer feedback
    app.post('/feedback', (req, res) => {
        const feedbacks = req.body;
        feedbackCollection.insertOne(feedbacks)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })


    //get client feedback
    app.get('/getFeedbacks', (req, res) => {
        feedbackCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })

    })

    //order list 
    app.get('/orderList', (req, res) => {
        orderCollection.find({email: req.query.email})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    //add new services
    app.post('/addServices', (req, res) => {
        const file = req.files.image;
        const title = req.body.title;
        const description = req.body.description;
    
        const Img = file.data;
        const encImg = Img.toString('base64');

        var image = {
            contentType: req.files.image.mimetype,
            size: req.files.image.size,
            img: Buffer.from(encImg, 'base64')
        };
        console.log(file, title,description)
        servicesCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    //get services
    app.get('/getServices', (req, res) => {
        servicesCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    //make admin 
    app.post('/makeAdmin', (req, res) => {
        const admins = req.body;
        adminCollection.insertOne(admins)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    //get admin
    app.get('/getAdmin', (req, res) => {
        adminCollection.find({email: req.query.email})
        console.log(req.query.email)
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    //end
});

app.listen(process.env.PORT || port)