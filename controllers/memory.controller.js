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

    // Create then upload thumbnail
    const thumbnail = await imageThumbnail( file.buffer, thumbnailConfig );
    await googleStorage.uploadImage( { originalname: file.originalname+"--thumbnail", buffer: thumbnail } );

    // Create a Memory
    const memory = new Memory({
      title: req.body.title,
      description: req.body.description,
      state: req.body.state,
      destination: req.body.destination ? req.body.destination : false,
      fileUrl: fileUrl
    });

    // Save Memory in the database
    memory
      .save( memory )
      .then( data => {
        res.send( data );
        console.log( "created and saved" );
      })
      .catch( error => {
        res.status( 500 ).send({
          message:
            error.message || "Some error occurred while saving the Memory."
        });
      });
  } catch ( error ) {
    res.status( 500 ).send({
      message:
        error.message || "Wahh Some error occurred while creating the Memory."
    });
  }
};

// Retrieve all Memories from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Memory.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ideas."
      });
    });
};

// Find a single Memory with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Memory.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Memory with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Memory with id=" + id });
    });
};

// Update a Memory by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Memory.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Memory with id=${id}. Maybe Memory was not found!`
        });
      } else res.send({ message: "Memory was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Memory with id=" + id
      });
    });
};

// Delete a Memory with the specified id in the request
exports.delete = (req, res) => {
  try {

    const id = req.params.id;

    Memory.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Memory with id=${id}. Maybe Memory was not found!`
          });
        } else {
          // TODO: If fails to delete file then it shouldn't delete memory
          googleStorage.deleteFile( data.fileUrl );
   
          res.send({
            message: "Memory was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Memory with id=" + id
        });
      });
  }
  catch ( error ) {
    res
      .status( 500 )
      .send({
        message: error.message || "Some error occured while deleting the memory."
      })
  }
};

// Delete all Memories from the database.
exports.deleteAll = (req, res) => {
  Memory.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Memories were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all ideas."
      });
    });
};

// Find all Memories by state
exports.findAllByState = ( req, res ) => {
  const state = req.params.state;

  Memory.find({ state: state })
    .then( data => {
      res.send( data );
    })
    .catch( err => {
      res.status( 500 ).send({
        message:
          err.message || "Some error occurred while retrieving memories."
      });
    });
};

// Find all Memories by destination
exports.findAllByDestination = ( req, res ) => {
  const destination = req.params.destination;

  Memory.find({ destination: destination })
    .then( data => {
      res.send( data );
    })
    .catch( err => {
      res.status( 500 ).send({
        message:
          err.message || "Some error occurred while retrieving memories."
      });
    });
};

