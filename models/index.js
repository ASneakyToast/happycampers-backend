// const datastoreConfig = require('../config/datastore.config.js'); // I guess I don't need this do I?
const { Datastore } = require( "@google-cloud/datastore" );
const path = require( "path" );
const serviceKey = path.join( __dirname, "../config/datastoreKey.json" );

// Create a Client
const datastore = new Datastore({
  keyFilename: serviceKey,
  projectId: "happycampers"
});

// Create db Object
const db = {}; 
// db.url = dbConfig.url; // Havnt changed this yet
db.datastore = datastore;
db.memories = require( './memory.model.js' )( datastore ); 

module.exports = db; 
