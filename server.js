// uncomment below and Run to see your Repl's database URL
//console.log(process.env.REPLIT_DB_URL);

const endpoint = process.env.REPLIT_DB_URL; 
const Database = require("@replit/database")
const express = require('express');
const bodyParser = require('body-parser');
const atob = require("atob");
const btoa = require("btoa");

const database = new Database();
const app = express();

var userSchema = "users:"

app.use(express.json());
app.use(bodyParser.text());

// middleware usage
app.use(function (req, res, next) {
  credentialCheck(req, res, next);
});

app.get('/', (req, res) => {
  res.send("Welcome to your database proxy!\n" + 
  "Hit me from other REPLs, localhost, or\n" +
  "even externally hosted projects to use\n" + 
  "this REPL's key-value 50 MB database.");
});

// get all keys
app.get('/list/', (req, res) => {
  database.list().then(keys => {
    res.send(keys);
    console.log(keys)
  }).catch(console.log);
});

// get single value
app.get('/:key', (req, res) => {

  let key = req.params["key"];

  database.get(key, { raw: false }).then(value => {
    console.log(value);
    res.send(value)
  }).catch(console.log);
});

// get list of keys matching prefix
app.get('/list/:prefix', (req, res) => {

  let prefix = req.params["prefix"];

  database.list(prefix).then(keys => {
    res.send(keys);
    console.log(keys)
  }).catch(console.log);
});

// saves body as the value
app.post('/:key', async (req, res) => {

  let key = req.params["key"];
  let value = req.body;

  if (await checkKeyExistence(key)) {
    res.send("Key already exists. PUT to update value.")
  }
  else {
    database.set(key, value).then(() => {
      console.log(value);
      res.send(key + " successfully added");
    });
  }
});

// updates an existing key
app.put('/:key', async (req, res) => {

  let key = req.params["key"];
  let value = req.body;

  if (await checkKeyExistence(key)) {
    database.set(key, value).then(() => {
      console.log(value);
      res.send(key + " successfully updated.");
    });
  }
  else {
    res.send("Key not found. POST to add key.")
  }

});

// saves key-value pair from url
app.post('/:key/:value', async (req, res) => {

  let key = req.params["key"];
  let value = req.params["value"];

  if (await checkKeyExistence(key)) {
    res.send("Key already exists. PUT to update value.")
  }
  else {
    database.set(key, value).then(() => {
      console.log(value);
      res.send(key + " successfully added.");
    });
  }
});

// updates an existing key
app.put('/:key/:value', async (req, res) => {

  let key = req.params["key"];
  let value = req.params["value"];

  if (await checkKeyExistence(key)) {
    database.set(key, value).then(() => {
      console.log(value);
      res.send(key + " successfully updated.");
    });
  }
  else {
    res.send("Key not found. POST to add key.")
  }

});

// deletes a key-value pair
app.delete('/:key', async (req, res) => {

  let key = req.params["key"];
  if (await checkKeyExistence(key)) {
    database.delete(key);
    res.send(key + " deleted.");
  }
  else {
    res.sendStatus(404)
  }
});

// Creates a confirmation number for database purge
app.delete('/purgeDatabase/confirm', (req, res) => {

  let confirmationNumber = Math.floor((Math.random() * 999999) + 1);

  database.set("DeleteConfirmation:", confirmationNumber).then(() => {
    console.log(confirmationNumber);
    res.send("Are you sure? \nDELETE to this endpoint: /purgeDatabase/confirm/" + confirmationNumber);
  });

});

// Compares confirmation number and empties database on match 
app.delete('/purgeDatabase/confirm/:confirmationNumber', async (req, res) => {

  let confirmationNumber = req.params["confirmationNumber"];

  if (await checkValueMatch("DeleteConfirmation:", confirmationNumber)) {
    database.empty();
    res.send("All database key-value pairs purged.\nUse the below CURL to create a new user.\n" +
      "curl " + process.env.REPLIT_DB_URL + " -d users:usernamehere=passwordhere");
  }
  else {
    res.send("Invalid purge confirmation number.\n" + 
    "DELETE to this endpoint: /purgeDatabase/confirm to get your confirmation number")
  }

});

// Add User
app.post('/Users/Add/:username', async (req, res) => {

  let username = req.params["username"];
  let value = req.body;

  // converts plaintext password to base-64 encoded ascii
  let password = btoa(value);
  console.log(password);

  if (await checkKeyExistence(userSchema + username)) {
    res.send("User already exists. PUT Users/Update to update password.")
  }
  else {
    database.set(userSchema + username, password).then(() => {
      res.send(username + " successfully added");
    });
  }
});

// Update User Password
app.put('/Users/Update/:username', async (req, res) => {

  let username = req.params["username"];
  let value = req.body;

  // converts plaintext password to base-64 encoded ascii
  let password = btoa(value);
  console.log(password);

  if (await checkKeyExistence(userSchema + username)) {
    database.set(userSchema + username, password).then(() => {
      res.send(username + " successfully updated");
    });
  }
  else {
    res.send("User does not exist. POST /Users/Add/ to create user.");
  }
});

// retrieve repl.it db url 
app.get('/configuration/dbEndpoint', (req, res) => {

	console.log("Your database endpoint is: " + endpoint);
	res.send("Your database endpoint is: " + endpoint);
});


// checks if a key is present in database
async function checkKeyExistence(key) {

  let keyExists = await database.get(key, { raw: true });
  if (keyExists) {
    console.log("key exists")
    return true;
  }
  else {
    console.log("key does not exist")
    return false;
  }
};

// checks if passed in key and value matches what is present in database
async function checkValueMatch(key, value) {

  let storedValue = await database.get(key, { raw: false });
  if (storedValue == value) {
    console.log("values match")
    return true;
  }
  else {
    console.log("values do not match")
    return false;
  }
};

// authentication middleware: Basic Auth. 
async function credentialCheck(req, res, next) {
  let validCreds = false;
  let passedInCreds = null;
  let colonLocation = null;
  let username = null;
  let password = null;
  let credentials = req.get('Authorization');
  try {
    if (credentials) {
      credentials = credentials.replace("Basic ", "");
      console.log(credentials);
      // converts Base-64 encoded Ascii back to binary
      passedInCreds = atob(credentials);
      console.log(passedInCreds)
      // locates the split
      colonLocation = passedInCreds.search(":");
    };
    
    // splits the credentials into username and password
    username = passedInCreds.substr(0, colonLocation);
    password = passedInCreds.substr(colonLocation + 1, passedInCreds.length - 1);
    
    // converts the password to Base-64 encoded Ascii, which is 
    // how a user's password is stored in the db
    password = btoa(password);

    if (await checkKeyExistence(userSchema + username)) {
      validCreds = await checkValueMatch(userSchema + username, password);
    }

    if (validCreds) {
      next();
    }
    else {
      res.sendStatus(401);
    }
  }
  catch {
    res.status(400).send("Add an Authorization header with\n" +
    "valid credentials. See README. \n"+
    "To disable this auth check "+
		"(which makes your db publicly accessible), " +
    "comment or remove lines 16-18 of server.js (middleware usage).")
  }
};

app.listen(8000, () => {
  console.log('listening on port 8000')
});