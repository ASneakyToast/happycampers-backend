module.exports = ( datastore ) => {
  // const memoryKey = datastore.key( "Memory" );

  class Memory {
    constructor( props ) {
      //this.key = memoryKey;
      this.data = [
        {
          name: "created",
          value: new Date().toJSON(),
        },
        {
          name: "title",
          value: props.title,
          // required: true // Can I add this here?
        },
        {
          name: "description",
          value: props.description,
          excludeFromIndexes: true
        },
        {
          name: "state",
          value: props.state,
        },
        {
          name: "destination",
          value: props.destination
        },
        {
          name: "fileUrl",
          value: props.fileUrl,
          // required: true // Can I add this here?
        }
      ];
    }

    /* Wait do I even need this stuff?
    // Ugh should I just be searlizing this stuff?
    function entity() {
      return {
        taskKey : taskKey,
        data : [
          {
            name: "created",
            value: this.data[ "created" ],
          },
          {
            name: "title",
            value: props.title,
            // required: true // Can I add this here?
          },
          {
            name: "description",
            value: props.description,
            excludeFromIndexes: true
          },
          {
            name: "state",
            value: props.state,
          },
          {
            name: "destination",
            value: props.destination
          },
          {
            name: "fileUrl",
            value: props.fileUrl,
            // required: true // Can I add this here?
          }
        ];
      }
    }

    function save() {
      return new Promise(( resolve, reject ) => {
        await datastore.save( this );
        resolve 
      }
    }
    */
  }

  return Memory;
}

