if (Meteor.isServer) {

  var localdb = new MongoInternals.RemoteCollectionDriver("mongodb://localhost/dummy");

  // Global API configuration
  /*
  * Why is defaultOptionsEndpoint added?
  * See - https://github.com/kahmali/meteor-restivus/issues/125
  *
  */
  var Api = new Restivus({
    useDefaultAuth: false,
    prettyJson: true,
    enableCors: true,
    defaultOptionsEndpoint: {
        action: function () {
            this.response.writeHead(201, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Z-Key',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            });
            this.done();
            return {
                status: "success",
                "data": {
                    "message": "We love OPTIONS"
                }
            };
        }
    }
  });



  productsCollection = new Mongo.Collection("query", { _driver: localdb });
  Api.addCollection(productsCollection);
  
  
  productsCollection = new Mongo.Collection("datasource", { _driver: localdb });
  Api.addCollection(productsCollection);
  productsCollection = new Mongo.Collection("admin", { _driver: localdb });
  Api.addCollection(productsCollection);
  
}