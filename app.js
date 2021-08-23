const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const googleStorage = require( "./helpers/googleStorage.helper.js" );
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();


var corsOptions = {
  origin: "http://127.0.0.1:8080"
};

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


app.disable( "x-powered-by" ); // Do I need this? what does it do?
app.use( cors( corsOptions ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({
  extended: true
}));


// DB Connect
const db = require('./models');
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(err => {
    console.log("Can not connect to the database", err);
    process.exit();
  });


// API
require("./routes/tutorial.routes")(app);
require("./routes/idea.routes")(app);
require("./routes/memory.routes")(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Lithgow application." });
});


// Create port
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})


// Find 404
app.use((req, res, next) => {
  res.status( 404 )
    .send( "Unable to find the requested source" );
});


// error handler
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
