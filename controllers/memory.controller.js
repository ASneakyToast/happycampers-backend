const db = require( "../models" );
const Memory = db.memories;
const googleStorage = require( "../helpers/googleStorage.helper.js" );
const thumbnailConfig = require( "../config/thumbnail.config.js" );
const imageThumbnail = require( "image-thumbnail" );


// Create and Save a new Memory
exports.create = async (req, res) => {
  try {

    // Validate request
    if ( !req.body.title ) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }
    if ( !req.file ) {
      res.status( 400 ).send({
        message: "Please upload file"
      });
      return;
    }

    const file = req.file;
    console.log( file );

    // Upload file and return url
    const fileUrl = await googleStorage.uploadImage( file );
    console.log( `Uploaded file at: ${ fileUrl }` );

    // Create then upload thumbnail
    const thumbnail = await imageThumbnail( file.buffer, thumbnailConfig );
    const thumbnailUrl = await googleStorage.uploadImage( { originalname: file.originalname+"--thumbnail", buffer: thumbnail } );
    console.log( `Uploaded thumbnail at: ${ thumbnailUrl }` );

    // Create a Memory
    const memoryKey = db.datastore.key( "Memory" );
    const memory = new Memory({
      title: req.body.title,
      description: req.body.description,
      state: req.body.state,
      destination: req.body.destination ? req.body.destination : false,
      fileUrl: fileUrl
    });

    // Save Memory in the database
    const savedMemory = await db.datastore.save({
      key: memoryKey,
      data: memory.data 
    });

    // Validate via get + get key
    const [ getMemory ] = await db.datastore.get( memoryKey );
    const memoryId = getMemory[ db.datastore.KEY ][ "id" ];
    // console.log( savedMemory[0].mutationResults[0].key.path[0].id ); // This works as a way to get the id as well

    // Respond save + key 
    res.json({
      data: savedMemory,
      id: memoryId,
    });
    console.log( "created and saved" );
  }
  catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Wahh Some error occurred while creating the Memory."
    });
  }
};

// Retrieve all Memories from the database.
exports.findAll = async (req, res) => {

  // Find all Memories
  try {
    const query = db.datastore
      .createQuery( "Memory" )
      .order( "created" );
    // const [ memories ] = await db.datastore.runQuery( query );
    await db.datastore.runQuery( query, ( error, entities ) => {
      let memories = entities.map( entity => {
        console.log( entity[ db.datastore.KEY ][ "id" ]);
        entity.id = entity[ db.datastore.KEY ][ "id" ];
        return entity;
      })

      res.send( memories );
      console.log( "Found memories:" );
      console.log( memories );
    })
  }
  catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Some error occuring while getting Memories."
    });
  }
};

// Find a single Memory with an id
exports.findOne = async (req, res) => {

  // Setup references
  const id = Number( req.params.id );
  const memoryKey = db.datastore.key([ "Memory", id ]);

  // Find Memory
  try {
    const [ memory ] = await db.datastore.get( memoryKey );
    res.status( 201 ).send( memory );
    console.log( "Found memory:" );
    console.log( memory );
  }
  catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Some error occuring while getting Memory."
    });
  }
};

// Update a Memory by the id in the request
exports.update = async (req, res) => {

  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  // Setup references
  const transaction = db.datastore.transaction();
  const id = Number( req.params.id );
  const memoryKey = db.datastore.key([ "Memory", id ]);

  // Update Memory
  try {
    await transaction.run();
    const [ memory ] = await transaction.get( memoryKey );
    // Do updates here? ( ie task.done = true; )
    //
    transaction.save({
      key: memoryKey,
      data: memory
    });

    await transaction.commit();
    res.send({
      message: `Memory ${ memoryKey } updated successfully.`
    });
  }
  catch ( error ) {
    await transaction.rollback();
    res.status( 500 ).send({
      message: error.message || "Some error occured while deleting the memory."
    })
  }
};

// Delete a Memory with the specified id in the request
exports.delete = async (req, res) => {
  const id = Number( req.params.id );
  const memoryKey = db.datastore.key([ "Memory", id ]);

  try {
    await db.datastore.delete( memoryKey );
    res.send({
      message: `Memory ${ memoryKey } deleted successfully.`
    });
  }
  catch ( error ) {
    res.status( 500 ).send({
      message: error.message || "Some error occured while deleting the memory."
    })
  }
};

// Delete all Memories from the database.
exports.deleteAll = async (req, res) => {
  console.log( "Attempting to delete all memories..." );

  try {
    const query = db.datastore
      .createQuery( "Memory" )
      .order( "created" );
    const [ entities ] = await db.datastore.runQuery( query, ( error, entities ) => {
      console.log( error || entities );
    
      if ( entities.length > 0 ) {
        entities.map( entity => {
          console.log( `Deleting memory with key: ${ entity[ db.datastore.KEY ] }` );
          db.datastore.delete( entity[ db.datastore.KEY ] )
          // return entity[ db.datastore.KEY ];
        })
      }
    })

    res.send({
      message: "Memories deleted successfully."
    });
  }
  catch ( error ) {
    res.status( 500 ).send({
      message: error.message || "Some error occurred while deleting all memories."
    })
  }
}

// Find all Memories by state
exports.findAllByState = async ( req, res ) => {

  // Setup references
  const state = req.params.state;

  // Find state-related memories
  try {
    const query = db.datastore.createQuery( "Memory" )
      .filter( "state", "=", state )
    console.log( query );
    const [ memories ] = await db.datastore.runQuery( query );

    res.status( 201 ).send( memories );
    console.log( "Found state related Memories" );
    console.log( memories );
  }
  catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Some error occuring while getting state-related Memories."
    });
  }
};

// Find all Memories by destination
exports.findAllByDestination = async ( req, res ) => {

  // Setup references
  const destination = req.params.state;

  // Find destination-related memories
  try {
    const query = db.datastore.createQuery( "Memory" )
      .filter( "state", "=", destination )
    const [ memories ] = await db.datastore.runQuery( query );

    res.status( 201 ).send( memories );
    console.log( "Found destination related Memories" );
  }
  catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Some error occuring while getting state-related Memories."
    });
  }
};
