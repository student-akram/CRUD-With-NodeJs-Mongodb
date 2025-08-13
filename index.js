// Import Express framework
const express = require('express');
const app = express();

// Import MongoDB client and ObjectId for database operations
const { MongoClient, ObjectId } = require('mongodb');

// Database configuration
const dbName = "mydatabase"; // Name of the database
const url = "mongodb://localhost:27017"; // Local MongoDB URL
const client = new MongoClient(url); // MongoDB client instance

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Set view engine to EJS for rendering HTML templates
app.set('view engine', 'ejs');

// ------------------ ROUTES ------------------

// GET request for home page - displays all students
app.get('/', async (req, resp) => {
  await client.connect(); // Connect to MongoDB
  const db = client.db(dbName);
  const collection = db.collection('students');
  const students = await collection.find().toArray(); // Get all student records
  resp.render("students", { students }); // Render 'students' view with data
});

// GET request for "Add Student" form
app.get('/add', (req, resp) => {
  // Simple HTML form for student input
  resp.send(`
    <form method="post" action="add-student">
      <input type="text" name="name" placeholder="Enter user name" /><br /><br />
      <input type="text" name="age" placeholder="Enter age" /><br /><br />
      <input type="text" name="email" placeholder="Enter email" /><br /><br />
      <button type="submit">Submit</button>
    </form>
  `);
});

// POST request to add a student to the database
app.post("/add-student", async (req, resp) => {
  await client.connect(); // Ensure MongoDB connection
  const db = client.db(dbName);
  const collection = db.collection('students');
  await collection.insertOne(req.body); // Insert form data into 'students' collection
  resp.send('Data saved'); // Send confirmation
});

// API endpoint to return all students as JSON
app.get('/api', async (req, resp) => {
  const db = client.db(dbName);
  const collection = db.collection('students');
  const students = await collection.find().toArray();
  resp.send(students); // Send JSON data
});

// DELETE request to remove a student by ID (API usage)
app.delete('/delete/:id', async (req, resp) => {
  console.log(req.params.id);
  const db = client.db(dbName);
  const collection = db.collection('students');
  const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  resp.send(result); // Send deletion result
});

// GET request to delete student (browser link usage)
app.get('/delete/:id', async (req, resp) => {
  console.log(req.params.id);
  const db = client.db(dbName);
  const collection = db.collection('students');
  const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  
  if (result) {
    resp.send("<h1>Student record deleted</h1>");
  } else {
    resp.send("<h1>Failed to delete</h1>");
  }
});

// GET request to fetch a specific student's details by ID for updating
//// Used to populate the update form with existing student data
app.get('/student/:id', async (req, resp) => {
  const id = req.params.id;
  console.log(id);

  const db = client.db(dbName);
  const collection = db.collection("students");
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

  // Render 'updateData' view with the selected student's details
  resp.render("updateData", { result });
});
// POST request to update a student's data based on their ID
app.post("/update/:id", (req, resp) => {
  console.log(req.body); // Log form data sent by the client
  console.log(req.params.id); // Log the student's ID from the URL

  const db = client.db(dbName); // Get database reference
  const collection = db.collection("students"); // Get 'students' collection

  // Filter: Find the student document whose _id matches the given ID
  const filter = { _id: new ObjectId(req.params.id) };

  // Update: Use $set to replace only the fields sent in req.body
  const update = { $set: req.body };

  // Perform the update operation on the matching document
  const result = collection.updateOne(filter, update);

  
  if (result) {
    
    resp.send("Data Updated!")
  } else {
    resp.send("Data not Updated")
  }
});

// Start the server on port 3100
app.listen(3100);
