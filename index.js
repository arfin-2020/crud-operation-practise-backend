const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectId;
require('dotenv').config()

const app = express();
const port = 5000;


//Middleware
app.use(cors());
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Server successfully run.')
});

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r5j5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// console.log(uri)

// const products = {
//     name:"Apple",
//     price: '45',
//     quantity: '23'
// }
const run = async() =>{
    try{
        await client.connect();
        const productsCollection = client.db("productsMaster").collection("Products");
    //    await productsCollection.insertOne(products)
    //     .then(result=>{
    //         console.log(`A document was inserted with the _id: ${result.insertedId}`);
    //     })
    //     .catch(err=>{
    //         console.log(err.message)
    //     })
        //   console.log("Connected successfully to server");


        //GET Method

        app.get('/products',async(req,res)=>{
            const dataFromDB = productsCollection.find({});
            await dataFromDB.toArray()
            .then(result=>{
                // console.log('Data successfully come',result)
                res.send(result)
            })
            .catch(err=>{
                console.log(err.message)
            })
        });

        //GET Method using dynamic id 

        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            // console.log(id)
            const query = {_id : ObjectID(id)};
           await productsCollection.findOne(query)
           .then(result=>{
            console.log(`Data successfully come.`);
            res.json(result);
        })
        .catch(err=>{
            console.log(err.message)
        })
        })

        //POST Method

        app.post('/products',async(req,res)=>{
            const newProduct = req.body
            // console.log('She Hit me',req.body);
            // res.json('okssss')
            await productsCollection.insertOne(newProduct)
            .then(result=>{
                console.log(`A document was inserted with the _id: ${result.insertedId}`);
                res.json(result);
            })
            .catch(err=>{
                console.log(err.message)
            })

        });

        //UPDATE Method

        app.put('/products/:id',async(req, res)=>{
            const id = req.params.id;
            const updateProduct  = req.body;
            // console.log(updateProduct)
            // console.log(id)
            const filter = { _id: ObjectID(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    name: updateProduct.name,
                    price: updateProduct.price,
                    quantity: updateProduct.quantity
                }
            }
            const result = await productsCollection.updateOne(filter,updateDoc,options)
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
              );
              res.json(result)
        })

        //DELETE Method

        app.delete('/products/:id',async(req,res)=>{
            const id = req.params.id;
            // console.log(id);
            const query = {_id: ObjectID(id)};
            const result = await productsCollection.deleteOne(query);
            if (result.deletedCount === 1) {
            console.log("Successfully deleted one document.");
            res.json(result)
            } else {
            console.log("No documents matched the query. Deleted 0 documents.");
            }
                })
    }catch(err){
        console.log('error-------',err.message)
    }
}

run().catch(console.dir);







app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
});