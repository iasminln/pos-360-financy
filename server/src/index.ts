import "dotenv/config";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { createContext } from "./context.js";
import { typeDefs, resolvers } from "./schema/index.js";

const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "*";
const allowedOrigins =
  corsOrigin === "*"
    ? null
    : corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: createContext,
  cors: (request) => {
    const requestOrigin = request.headers.get("origin") ?? undefined;

    if (!allowedOrigins) {
      return {
        origin: requestOrigin,
        credentials: true,
      };
    }

    return {
      origin:
        requestOrigin && allowedOrigins.includes(requestOrigin)
          ? requestOrigin
          : allowedOrigins,
      credentials: true,
    };
  },
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`Financy GraphQL ready at http://localhost:${port}/graphql`);
});
