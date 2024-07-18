import { Layer } from "effect";
import { makeRemixRuntime } from "~/lib/utilities";
import { TodoService } from "./Todo";

export const { loaderFunction } = makeRemixRuntime(
  Layer.mergeAll(TodoService.Live)
);
