const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vfwpldl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){

    try{
        const appointmentOptionCollection = client.db('doctorsPortal').collection('appointmentOptions') 

        app.get('/appointmentOptions', async(req, res) =>{
            const query = {}
            const cursor = appointmentOptionCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

    }
    finally{

    }
}
run().catch(console.log())

app.use('/', (req, res)=>{
    res.send('doctor server is running')
})


app.listen(port, (req, res) =>{
    console.log('api is running', port);
})