const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muank.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("by_cycle_shop");
        const usersCollection = database.collection("users");

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;

            if (user?.role === 'admin') {
                isAdmin = true;
            }
            
            res.send({ admin: isAdmin });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bi Cycle Shop server is running!')
});

app.listen(port, () => {
    console.log(`Bi Cycle Shop server listening at http://localhost:${port}`)
});