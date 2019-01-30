const { ApolloServer, gql, PubSub } = require("apollo-server");
const trails = require("./data/trails.json");

const pubsub = new PubSub();

const context = { trails, pubsub };

const typeDefs = gql`
  type Trail {
    id: ID!
    name: String!
    status: TrailStatus
    difficulty: String!
    groomed: Boolean!
    trees: Boolean!
    night: Boolean!
  }

  enum TrailStatus {
    OPEN
    CLOSED
  }

  type Query {
    allTrails(status: TrailStatus): [Trail!]!
    Trail(id: ID!): Trail!
    trailCount(status: TrailStatus!): Int!
  }

  type Mutation {
    setStatus(id: ID!, status: TrailStatus!): Trail!
  }

  type Subscription {
    statusChange: Trail
  }
`;
const resolvers = {
  Query: {
    allTrails: (root, { status }, { trails }) => {
      if (!status) {
        return trails;
      } else {
        let filteredTrails = trails.filter(trail => trail.status === status);
        return filteredTrails;
      }
    },
    Trail: (root, { id }, { trails }) => {
      let selectedTrail = trails.filter(trail => id === trail.id);
      return selectedTrail[0];
    },
    trailCount: (root, { status }, { trails }) => {
      let i = 0;
      trails.map(trail => {
        trail.status === status ? i++ : null;
      });
      return i;
    }
  },
  Mutation: {
    setStatus: (root, { id, status }, { trails, pubsub }) => {
      let updatedTrail = trails.find(trail => id === trail.id);
      updatedTrail.status = status;
      pubsub.publish("trail-status-change", {
        trailStatusChange: updatedTrail
      });
      return updatedTrail;
    }
  },
  Subscription: {
    statusChange: {
      subscribe: (root, data, { pubsub }) =>
        pubsub.asyncIterator("trail-status-change")
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});

server.listen(4002).then(({ port }) => {
  console.log(`Trail Service running on ${port}`);
});
