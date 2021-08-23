module.exports = mongoose => {
    const memorySchema = mongoose.Schema({
      title: { 
        type: String,
        required: [ true, "Please include a title" ]
      }, 
      description: {
        type: String,
        required: false 
      }, 
      state: {
        type: String,
        required: [ true, "Please include the state this was taken in." ]
      },
      destination: {
        type: String,
        required: false
      },
      fileUrl: {
        type: String,
        required: [ true, "Please include a file." ] 
      }
    }, {
      timestamps: true
    }
  );

  const Memory = mongoose.model( "memory", memorySchema );
  return Memory;
};
