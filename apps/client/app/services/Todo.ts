import { Console, Effect, Layer } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Todo } from "~/types/Todo";
import { Schema } from "@effect/schema";

const makeTodoService = Effect.sync(() => {
  return {
    getAllTodos: Effect.gen(function* (_) {
      const defaultClient = yield* _(HttpClient.HttpClient);
      const client = defaultClient.pipe(
        HttpClient.mapRequest(
          HttpClientRequest.prependUrl("http://localhost:4000/")
        )
        // HttpClient.tap(Console.log)
      );
      const responseSchema = Schema.Struct({
        data: Schema.Struct({ todos: Schema.Array(Todo) }),
      });
      const schemaClient = client.pipe(
        HttpClient.mapEffectScoped(
          HttpClientResponse.schemaBodyJson(responseSchema)
        ),
        HttpClient.map((r) => r.data.todos)
      );
      const requestSchema = Schema.Struct({ query: Schema.String });

      const postQuery = HttpClient.schemaFunction(
        schemaClient,
        requestSchema
      )(HttpClientRequest.post("graphql"));
      const response = yield* postQuery({
        query: "query { todos { id title status createdAt } }",
      });

      // yield* Console.log(response);
      return response;
    }),

    flip: (id: number) =>
      Effect.gen(function* () {
        const defaultClient = yield* HttpClient.HttpClient;
        const client = defaultClient.pipe(
          HttpClient.mapRequest(
            HttpClientRequest.prependUrl("http://localhost:4000/")
          ),
          HttpClient.tap(Console.log)
        );
        const responseSchema = Schema.Struct({
          data: Schema.Struct({ flip: Todo }),
        });
        const schemaClient = client.pipe(
          HttpClient.tap(Console.log),
          HttpClient.mapEffectScoped(
            HttpClientResponse.schemaBodyJson(responseSchema)
          ),
          HttpClient.map((r) => r.data.flip)
        );
        const requestSchema = Schema.Struct({
          query: Schema.String,
          variables: Schema.Record(Schema.String, Schema.Number),
        });

        const postQuery = HttpClient.schemaFunction(
          schemaClient,
          requestSchema
        )(HttpClientRequest.post("graphql"));
        const response = yield* postQuery({
          query: `mutation Mutation( $flipId: Int!) { flip(id: $flipId) { createdAt id title status }}`,
          variables: { flipId: id },
        });
        // yield* Console.log(response);
        return response;
      }),
    add: (title: string) =>
      Effect.gen(function* () {
        yield* Console.log("Adding todo" + title);
        // return { id: "1", title: "New Todo", status: "ACTIVE", createdAt: "" };
        const defaultClient = yield* HttpClient.HttpClient;
        const client = defaultClient.pipe(
          HttpClient.mapRequest(
            HttpClientRequest.prependUrl("http://localhost:4000/")
          )
          // HttpClient.tap(Console.log)
        );
        const responseSchema = Schema.Struct({
          data: Schema.Struct({ add: Todo }),
        });
        const schemaClient = client.pipe(
          HttpClient.mapEffectScoped(
            HttpClientResponse.schemaBodyJson(responseSchema)
          ),
          HttpClient.map((r) => r.data.add)
        );
        const requestSchema = Schema.Struct({
          query: Schema.String,
          variables: Schema.Record(Schema.String, Schema.String),
        });

        const postQuery = HttpClient.schemaFunction(
          schemaClient,
          requestSchema
        )(HttpClientRequest.post("graphql"));
        const response = yield* postQuery({
          query: `mutation Mutation( $title: String!) { add(title: $title) { createdAt id title status }}`,
          variables: { title },
        });
        // yield* Console.log(response);
        return response;
      }),
    delete: (id: number) =>
      Effect.gen(function* () {
        const defaultClient = yield* HttpClient.HttpClient;
        const client = defaultClient.pipe(
          HttpClient.mapRequest(
            HttpClientRequest.prependUrl("http://localhost:4000/")
          )
          // HttpClient.tap(Console.log)
        );
        const responseSchema = Schema.Struct({
          data: Schema.Struct({ delete: Schema.Null }),
        });
        const schemaClient = client.pipe(
          HttpClient.mapEffectScoped(
            HttpClientResponse.schemaBodyJson(responseSchema)
          )
        );
        const requestSchema = Schema.Struct({
          query: Schema.String,
          variables: Schema.Record(Schema.String, Schema.Number),
        });

        const postQuery = HttpClient.schemaFunction(
          schemaClient,
          requestSchema
        )(HttpClientRequest.post("graphql"));
        const response = yield* postQuery({
          query: `mutation Mutation( $id: Int!) { delete(id: $id) }`,
          variables: { id },
        });
        // yield* Console.log(response);
        return response;
      }),
  };
});

export class TodoService extends Effect.Tag("@services/Todo")<
  TodoService,
  Effect.Effect.Success<typeof makeTodoService>
>() {
  static Live = Layer.effect(this, makeTodoService);
}
