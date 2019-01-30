const { ApolloServer, gql, PubSub } = require("apollo-server");
const lifts = require("./data/lifts.json");

const pubsub = new PubSub();

const context = { lifts, pubsub };

const typeDefs = gql`
  type Lift {
    id: ID!
    name: String!
    status: LiftStatus!
    capacity: Int!
    night: Boolean!
    elevationGain: Int!
  }

  enum LiftStatus {
    OPEN
    HOLD
    CLOSED
  }

  type Query {
    allLifts(status: LiftStatus): [Lift!]!
    Lift(id: ID!): Lift!
    liftCount(status: LiftStatus!): Int!
  }

  type Mutation {
    setStatus(id: ID!, status: LiftStatus!): Lift!
  }

  type Subscription {
    statusChange: Lift
  }
`;
const resolvers = {
  Query: {
    allLifts: (root, { status }, { lifts }) => {
      if (!status) {
        return lifts;
      } else {
        let filteredLifts = lifts.filter(lift => lift.status === status);
        return filteredLifts;
      }
    },
    Lift: (root, { id }, { lifts }) => {
      let selectedLift = lifts.find(lift => id === lift.id);
      return selectedLift[0];
    },
    liftCount: (root, { status }, { lifts }) => {
      let i = 0;
      lifts.map(lift => {
        lift.status === status ? i++ : null;
      });
      return i;
    }
  },
  Mutation: {
    setStatus: (root, { id, status }, { lifts, pubsub }) => {
      let updatedLift = lifts.find(lift => id === lift.id);
      updatedLift.status = status;
      pubsub.publish("lift-status-change", { liftStatusChange: updatedLift });
      return updatedLift;
    }
  },
  Subscription: {
    statusChange: {
      subscribe: (root, data, { pubsub }) =>
        pubsub.asyncIterator("lift-status-change")
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
});

server.listen(4001).then(({ port }) => {
  console.log(`Lift Service running on ${port}`);
});
