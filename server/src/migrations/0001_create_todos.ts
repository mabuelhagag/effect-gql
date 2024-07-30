import * as Effect from "effect/Effect";
import * as Sql from "@effect/sql";

export default Effect.gen(function* ($) {
  const sql = yield* $(Sql.SqlClient.SqlClient);

  yield* $(sql`
    CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status TEXT CHECK(status IN ('COMPLETED', 'ACTIVE')) DEFAULT 'ACTIVE',
        created_at datetime NOT NULL DEFAULT current_timestamp
    )`);
});
