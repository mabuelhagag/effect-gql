import {
  Context,
  Data,
  Duration,
  Effect,
  Layer,
  Metric,
  Schedule,
} from "effect";
import { Schema } from "@effect/schema";
import * as Sql from "@effect/sql";

import { EnvLive } from "./Sql";

//
// Data Model
//

export class Todo extends Schema.Class<Todo>("Todo")({
  id: Schema.Number,
  title: Schema.String,
  status: Schema.Literal("COMPLETED", "ACTIVE"),
  createdAt: Schema.DateFromString,
}) {}

export const TodoArray = Schema.Array(Todo);

export class GetAllTodosError extends Data.TaggedError("GetAllTodosError")<{
  message: string;
}> {}

//
// Policies
//

const retryPolicy = Schedule.exponential("10 millis").pipe(
  Schedule.compose(Schedule.elapsed),
  Schedule.whileOutput(Duration.lessThan("3 seconds"))
);

//
// Metrics
//

const getAllTodosErrorCount = Metric.counter("getAllTodosErrorCount");
const addTodoErrorCount = Metric.counter("addTodoErrorCount");
const deleteTodoErrorCount = Metric.counter("deleteTodoErrorCount");
const flipTodoStatusErrorCount = Metric.counter("flipTodoStatusErrorCount");
//
// Service Definition
//

export class TodoRepo extends Context.Tag("@context/Todos")<
  TodoRepo,
  Effect.Effect.Success<typeof makeTodoRepo>
>() {}

//
// Service Implementation
//

export const makeTodoRepo = Effect.gen(function* ($) {
  const sql = yield* $(Sql.SqlClient.SqlClient);

  const addTodo = (title: string) =>
    Effect.gen(function* ($) {
      const rows = yield* $(
        Effect.orDie(
          sql`INSERT INTO todos ${sql.insert([{ title }])} RETURNING *`
        ),
        Effect.withSpan("addTodoToDb")
      );
      const [todo] = yield* $(
        Effect.orDie(Schema.decodeUnknown(Schema.Tuple(Todo))(rows)),
        Effect.withSpan("parseResponse")
      );
      return todo;
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(addTodoErrorCount, () => 1),
      Effect.withSpan("addTodo")
    );

  const deleteTodo = (id: number) =>
    Effect.gen(function* ($) {
      yield* $(
        Effect.orDie(sql`DELETE FROM todos WHERE id = ${id}`),
        Effect.withSpan("deleteFromDb")
      );
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(deleteTodoErrorCount, () => 1),
      Effect.withSpan("deleteTodo")
    );

  const flipTodoStatus = (id: number) =>
    Effect.gen(function* ($) {
      yield* $(
        Effect.orDie(
          sql`UPDATE todos SET status = CASE 
          WHEN status = 'COMPLETED' THEN 'ACTIVE' 
          ELSE 'COMPLETED' END WHERE id = ${id}`
        ),
        Effect.withSpan("flipTodoStatus")
      );
      const rows = yield* $(
        Effect.orDie(sql`SELECT * FROM todos WHERE id = ${id}`),
        Effect.withSpan("getFromDb")
      );
      const [todo] = yield* $(
        Effect.orDie(Schema.decodeUnknown(Schema.Tuple(Todo))(rows)),
        Effect.withSpan("parseResponse")
      );
      return todo;
    }).pipe(
      sql.withTransaction,
      Metric.trackErrorWith(flipTodoStatusErrorCount, () => 1),
      Effect.withSpan("flipTodoStatus")
    );
  const getAllTodos = Effect.gen(function* ($) {
    const rows = yield* $(
      Effect.orDie(sql`SELECT * from todos;`),
      Effect.withSpan("getFromDb")
    );
    const todos = yield* $(
      Effect.orDie(Schema.decodeUnknown(TodoArray)(rows)),
      Effect.withSpan("parseTodos")
    );
    if (Math.random() > 0.5) {
      return yield* $(
        new GetAllTodosError({
          message: "failure to get todos",
        })
      );
    }
    return todos;
  }).pipe(
    Metric.trackErrorWith(getAllTodosErrorCount, () => 1),
    Effect.withSpan("getAllTodos"),
    Effect.retry(retryPolicy),
    Effect.withSpan("getAllTodosWithRetry")
  );

  return {
    getAllTodos,
    addTodo,
    deleteTodo,
    flipTodoStatus,
  };
});

const TodoRepoLayer = Layer.effect(TodoRepo, makeTodoRepo);
export const TodoRepoLive = Layer.provideMerge(
  TodoRepoLayer,
  // SqlLive,
  EnvLive
);
