const multer = require( "multer" );
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = app => {
  const memories = require("../controllers/memory.controller.js");

  var router = require("express").Router();

  // Create a new Memory
  router.post("/", upload.single( "file" ), memories.create);

  // Retrieve all Memories
  router.get("/", memories.findAll);

  // Retrieve all Memories by state
  router.get("/state/:state", memories.findAllByState);

  // Retrieve all Memories by destination
  router.get("/destination/:destination", memories.findAllByDestination);

  // Retrieve a single Memory with id
  router.get("/:id", memories.findOne);

  // Update a Memory with id
  router.put("/:id", memories.update);

  // Delete a Memory with id
  router.delete("/:id", memories.delete);

  // Delete all Memories
  router.delete("/", memories.deleteAll);

  app.use('/api/memories', router);
};
