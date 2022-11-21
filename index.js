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

        const bookingsCollection = client.db('doctorsPortal').collection('bookings') 

        app.get('/appointmentOptions', async(req, res) =>{
            const date = req.query.date
            const query = {}
            const cursor = appointmentOptionCollection.find(query)
            const results = await cursor.toArray()
            const bookingQuery = {
                appiontmentDate: date
            }
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray()
            results.forEach(result =>{
                const optionBooked = alreadyBooked.filter(book => book.treatment === result.name)
                const bookedSlots = optionBooked.map(book => book.slot)
                const remainingSlot = result.slots.filter(slot => !bookedSlots.includes(slot))
                result.slots = remainingSlot
                // console.log(date, result.name, remainingSlot.length);
            })
            res.send(results)
        })
        app.get('/v2/appointmentOptions', async(req, res) =>{
            const date = req.query.date
            const options = await appointmentOptionCollection.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField:'name',
                        foreignField: 'treatment',
                        pipeline: [ 
                            {
                                $match: {
                                    $expr: {
                                       $eq: ['$appiontmentDate', date] 
                                    }
                                }
                            }
                         ],
                        as: 'booked'
                    }
                },
                {
                    $project: {
                        name: 1,
                        slots: 1,
                        booked: {
                            $map: {
                                input: '$booked',
                                as: 'book',
                                in: '$$book.slot'
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        slots: {
                            $setDifference: ['$slots', '$booked']
                        }
                    }
                }
            ]).toArray();
            res.send(options)
        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const result = await bookingsCollection.insertOne(booking)
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