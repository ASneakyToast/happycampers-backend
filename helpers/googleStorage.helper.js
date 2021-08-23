const util = require( "util" );
const gc = require( "../config/gcloud.config.js" );
const bucket = gc.bucket( "example-memories" );

exports.deleteFile = async ( fileUrl ) => {
  try {
    const fileName = fileUrl.substring( fileUrl.lastIndexOf('/')+1);
    console.log( fileName );

    await bucket.file( fileName ).delete();
  } catch ( error ) {
    console.log( "Had troubble deleing file. Error: " + error );
    return {
      message: error || "Had trouble deleting file."
    }
  }
};


exports.uploadImage = ( file ) => new Promise(( resolve, reject ) => {

  const { originalname, buffer } = file;

  const blob = bucket.file( originalname.replace(/ /g, "_") );
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype
    }
  });

  let pubUrl = util.format(
    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
  );

  blobStream.on( "finish", async () => {
    const publicUrl = util.format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    resolve( publicUrl );
  })
  .on( "error", () => {
    reject({
      message: `Unable to upload image, something went wrong.`
    });
  })
  .end( buffer );
});
