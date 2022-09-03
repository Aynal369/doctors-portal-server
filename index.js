const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cuig1l3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("MongoDB connect successfully");
    const database = client.db("DoctorsPortal");
    const clientsCollection = database.collection("clients");
    const servicesCollection = database.collection("services");
    const bookingCollection = database.collection("booking");
    /* =========================== Clients Collection */
    app.post("/clients", async (req, res) => {
      try {
        const userData = req.body;
        const result = await clientsCollection.insertOne(userData);
        res.json(result);
      } catch (error) {
        res.json(error);
      }
    });
    app.put("/clients", async (req, res) => {
      try {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await clientsCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      } catch (error) {
        res.json(error);
      }
    });
    /* =========================== Services Collection */
    app.get("/services", async (req, res) => {
      try {
        const query = {};
        const cursor = servicesCollection.find(query);
        const services = await cursor.toArray();
        res.json(services);
      } catch (error) {
        res.json(error);
      }
    });
    /* =========================== Booking Collection */
    app.post("/booking", async (req, res) => {
      try {
        const booking = req.body;
        const query = {
          treatment: booking.treatment,
          timeSlot: booking.timeSlot,
          timeDate: booking.timeDate,
        };
        const exists = await bookingCollection.findOne(query);
        if (exists) {
          return res.send({ success: false, booking: exists });
        }
        const result = await bookingCollection.insertOne(booking);
        res.json({ success: true, result });
      } catch (error) {
        res.json(error);
      }
    });
    app.get("/available", async (req, res) => {
      try {
        const result = await bookingCollection.find().toArray();
        res.json(result);
      } catch (error) {
        res.json(error);
      }
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Doctors Portal");
});

app.listen(port, () => {
  console.log(`doctors portal listening on port ${port}`);
});
