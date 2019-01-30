// Required for HttpLink transport
//   - try with our without fetch
//   - fetch is used on line 14 and 15 when we setup the links
const fetch = require("node-fetch");
const { HttpLink } = require("apollo-link-http");
const { ApolloServer } = require("apollo-server");

// These are the tools required for schema stitching
const {
  introspectSchema,
  mergeSchemas,
  makeRemoteExecutableSchema
} = require("graphql-tools");

// We create 2 http links to each of our services, both lift and trail
const liftLink = new HttpLink({ uri: "http://localhost:4001", fetch });
const trailLink = new HttpLink({ uri: "http://localhost:4002", fetch });

const start = async () => {
  // First, you need to checkout the schema. This tells apollo what queries
  //  and mutations are available on that service. We're reading the
  //  remote schemas that are hosted on 4001 and 4002 using our custom http links
  const liftSchema = await introspectSchema(liftLink);
  const trailSchema = await introspectSchema(trailLink);

  // Now were are making the remote schema executable, first by
  // using the schema that we have read, and by supplying the HttpLink
  // that will be used to send and receive information
  const liftExecutableSchema = await makeRemoteExecutableSchema({
    schema: liftSchema,
    link: liftLink
  });

  const trailExecutableSchema = await makeRemoteExecutableSchema({
    schema: trailSchema,
    link: trailLink
  });

  const stitchedSchema = `

  extend type Lift {
    gnar: String
  }

  extend type Trail {
    gnar: String
  }
  `;

  // Now using merge schemas we can combine the executable schemas with our service.
  const schema = mergeSchemas({
    schemas: [liftExecutableSchema, trailExecutableSchema, stitchedSchema],

    // These are only needed for the bonus iteration
    resolvers: {
      Lift: {
        gnar: parent => {
          console.log("lift: ", parent);
          return "gnarly";
        }
      },
      Trail: {
        gnar: parent => {
          console.log("trail: ", parent);
          return "gnarly";
        }
      }
    }
  });

  // Create the server the same way
  const server = new ApolloServer({ schema });

  // Run the server the same way
  server
    .listen(4000)
    .then(({ port }) => console.log(`orch layer running on ${port}`));
};

start();
