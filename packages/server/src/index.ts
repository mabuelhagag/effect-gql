import { readFileSync } from "fs";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

export const serve = async (schemaFile: string, resolvers: any) => {
  const typeDefs = `#graphql${readFileSync(schemaFile, "utf-8")}`;
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`GraphQL Server ready at: ${url}`);
};
