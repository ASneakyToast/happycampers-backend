const Cloud = require( "@google-cloud/storage" );
const path = require( "path" );
const serviceKey = path.join( __dirname, "./gcloudKey.json" );

const { Storage } = Cloud;
const storage = new Storage( {
  keyFilename: serviceKey,
  projectId: "happycampers"
});

module.exports = storage;
