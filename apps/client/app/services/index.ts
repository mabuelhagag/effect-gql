import { Layer } from "effect";
import { makeRemixRuntime } from "~/lib/utilities";
import { TodoService } from "./Todo";
import { HttpClient } from "@effect/platform";

export const { loaderFunction, actionFunction } = makeRemixRuntime(
  Layer.mergeAll(TodoService.Live, HttpClient.layer)
);
