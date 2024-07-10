import * as Effect from "effect/Effect";
import * as Sql from "@effect/sql";

export default Effect.gen(function* ($) {
  const sql = yield* $(Sql.SqlClient.SqlClient);

  yield* $(sql`INSERT INTO todos (title) VALUES ('Try Remix with Vite')`);
  yield* $(sql`INSERT INTO todos (title) VALUES ('Integrate Effect')`);
  yield* $(sql`INSERT INTO todos (title) VALUES ('Integrate OpenTelemetry')`);
});
