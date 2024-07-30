import { Effect, ManagedRuntime, Layer, Context } from "effect";
import { Schema } from "@effect/schema";

import type { ActionFunction, LoaderFunction } from "@remix-run/node";

export const makeRemixRuntime = <R, E>(layer: Layer.Layer<R, E, never>) => {
  const runtime = ManagedRuntime.make(layer);

  const loaderFunction =
    <A, E>(
      body: (...args: Parameters<LoaderFunction>) => Effect.Effect<A, E, R>
    ): {
      (...args: Parameters<LoaderFunction>): Promise<A>;
    } =>
    (...args) =>
      runtime.runPromise(body(...args));

  const actionFunction =
    <A, E>(
      body: (
        ...args: Parameters<ActionFunction>
      ) => Effect.Effect<A, E, R | ActionContext>
    ): {
      (...args: Parameters<ActionFunction>): Promise<A>;
    } =>
    (...args) =>
      runtime.runPromise(
        body(...args).pipe(Effect.provideService(ActionContext, args[0]))
      );

  return { loaderFunction, actionFunction };
};

export interface ActionContext {
  readonly _: unique symbol;
}

export class ActionContext extends Context.Tag("@services/ActionContext")<
  ActionContext,
  Parameters<ActionFunction>[0]
>() {}

export const getFormDataEntries = ActionContext.pipe(
  Effect.flatMap(({ request }) => Effect.promise(() => request.formData())),
  Effect.map((formData) => Object.fromEntries(formData)),
  Effect.withSpan("getFormDataEntries")
);

export const getFormData = <I, A>(schema: Schema.Schema<I, A>) =>
  Effect.flatMap(getFormDataEntries, (entries) =>
    Schema.decodeUnknown(schema)(entries).pipe(Effect.withSpan("parseFormData"))
  ).pipe(Effect.withSpan("getFormData"));
