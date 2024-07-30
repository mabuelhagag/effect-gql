import { readFileSync } from "fs";
import path from "path";

import { Effect } from "effect";

import type { IResolvers } from "@graphql-tools/utils";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { TodoRepo, TodoRepoLive } from "./services/TodoRepo";

const resolvers: IResolvers = {
  Query: {
    todos: () =>
      Effect.flatMap(TodoRepo, (todo) => todo.getAllTodos).pipe(
        Effect.provide(TodoRepoLive),
        Effect.runPromise
      ),
  },
  Mutation: {
    add: (_, args, __) =>
      Effect.flatMap(TodoRepo, (todo) => todo.addTodo(args.title)).pipe(
        Effect.provide(TodoRepoLive),
        Effect.runPromise
      ),
    delete: (_, args, __) =>
      Effect.flatMap(TodoRepo, (todo) => todo.deleteTodo(args.id)).pipe(
        Effect.provide(TodoRepoLive),
        Effect.runPromise
      ),
    flip: (_, args, __) =>
      Effect.flatMap(TodoRepo, (todo) => todo.flipTodoStatus(args.id)).pipe(
        Effect.provide(TodoRepoLive),
        Effect.runPromise
      ),
  },
};
export const serve = async (schemaFile: string, resolvers: any) => {
  const schemaPath = path.join(__dirname, schemaFile);
  const typeDefs = `#graphql${readFileSync(schemaPath, "utf-8")}`;
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`GraphQL Server ready at: ${url}`);
};

serve("schema.graphql", resolvers).catch(console.error);
