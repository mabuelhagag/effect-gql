import type { MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import "todomvc-app-css/index.css";
import "todomvc-common/base.css";

import { useRef } from "react";

import { Effect } from "effect";
import { Schema } from "@effect/schema";

import { TodoService } from "~/services/Todo";
import { loaderFunction, actionFunction } from "~/services/index";
import { Todo } from "../types/Todo";
import { getFormData } from "~/lib/utilities";

export const meta: MetaFunction = () => {
  return [
    { title: "Remixing Effect" },
    {
      name: "description",
      content: "Integrate Effect & Remix for the greater good!",
    },
  ];
};

const ActionInput = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal("add"), title: Schema.Trimmed }),
  Schema.Struct({ _tag: Schema.Literal("flip"), id: Schema.NumberFromString }),
  Schema.Struct({ _tag: Schema.Literal("delete"), id: Schema.NumberFromString })
);
export const action = actionFunction(() =>
  Effect.gen(function* () {
    const data = yield* getFormData(ActionInput);
    console.log(data);
    switch (data._tag) {
      case "add":
        return yield* TodoService.add(data.title);

      case "flip":
        return yield* TodoService.flip(data.id);

      case "delete":
        return yield* TodoService.delete(data.id);
    }
  })
);

export const AddTodoForm = () => {
  const fetcher = useFetcher<typeof action>();
  return (
    <fetcher.Form method="post" action="?index">
      <input type="hidden" name="_tag" value="add" />
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        name="title"
      />
    </fetcher.Form>
  );
};

export const TodoRow = ({ todo }: { todo: Todo.Encoded }) => {
  const fetcher = useFetcher<typeof action>();
  const flipFormRef = useRef<HTMLFormElement>(null);

  const handleCheckboxChange = () => {
    if (flipFormRef.current) {
      fetcher.submit(flipFormRef.current);
    }
  };

  const isCompleted = todo.status === "COMPLETED";
  return (
    <li className={isCompleted ? "completed" : ""} key={todo.id}>
      <div className="view">
        <fetcher.Form
          method="post"
          action="?index"
          style={{ display: "inline" }}
          ref={flipFormRef}
        >
          <input type="hidden" name="_tag" value="flip" />
          <input type="hidden" name="id" value={todo.id} />
        </fetcher.Form>
        <input
          className="toggle"
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
        />
        <label>{todo.title}</label>
        <fetcher.Form
          method="post"
          action="?index"
          style={{ display: "inline" }}
        >
          <input type="hidden" name="_tag" value="delete" />
          <input type="hidden" name="id" value={todo.id} />
          <button className="destroy" type="submit" />
        </fetcher.Form>
      </div>
    </li>
  );
};

export const loader = loaderFunction(() => TodoService.getAllTodos);

export default function Index() {
  const todos = useLoaderData<typeof loader>();

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos...</h1>
        <AddTodoForm />
      </header>
      <section className="main">
        <input id="toggle-all" className="toggle-all" type="checkbox" />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoRow todo={todo} key={todo.id} />
          ))}
        </ul>
      </section>
    </section>
  );
}
