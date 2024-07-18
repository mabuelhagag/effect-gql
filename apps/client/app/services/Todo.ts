import { Effect, Layer } from "effect";
import { Todo } from "~/types/Todo";

const makeTodoService = Effect.sync(() => {
  return {
    getAllTodos: Effect.gen(function* () {
      const todos = [
        new Todo({
          id: 1,
          createdAt: new Date(),
          status: "CREATED",
          title: "Well well well, look who's streaming!",
        }),
      ];

      return yield* Todo.encodeArray(todos);
    }),
  };
});

export class TodoService extends Effect.Tag("@services/Todo")<
  TodoService,
  Effect.Effect.Success<typeof makeTodoService>
>() {
  static Live = Layer.effect(this, makeTodoService);
}
