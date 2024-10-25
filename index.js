const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// middleware

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working fine");
});

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // TODO - Data base name
    const db = client.db("bistroDB");
    const database = db.collection("menus");
    const reviewsDataCollection = db.collection("reviews");
    const cartCollection = db.collection("carts");

    app.get("/menu", async (req, res) => {
      const result = await database.find().toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsDataCollection.find().toArray();
      res.send(reviews);
    });

    // ! CART COLLECTION
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // app.delete("/carts/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await cartCollection.deleteOne(query);
    //   res.send(result);
    //   console.log(result);
    // });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;

      // Ensure the ID is properly converted to MongoDB ObjectId
      const query = { _id: new ObjectId(id) };

      try {
        const result = await cartCollection.deleteOne(query);

        if (result.deletedCount > 0) {
          res.status(200).send(result); // Send success response if item is deleted
        } else {
          res.status(404).send({ message: "Item not found" }); // If no items deleted
        }

        console.log(result); // Log the result to the server console
      } catch (error) {
        console.error("Error deleting item:", error);
        res
          .status(500)
          .send({ message: "An error occurred while deleting the item" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
