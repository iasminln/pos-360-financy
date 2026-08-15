import "dotenv/config";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { createContext } from "./context.js";
import { typeDefs, resolvers } from "./schema/index.js";

const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "*";

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: createContext,
  cors: {
    origin:
      corsOrigin === "*"
        ? true
        : corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
  },
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`Financy GraphQL ready at http://localhost:${port}/graphql`);
});
