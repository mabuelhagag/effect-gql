import path from "path";

import { Config, Layer, String } from "effect";
import * as Sqlite from "@effect/sql-sqlite-node";
import { NodeContext } from "@effect/platform-node";

export const SqlLive = Sqlite.SqliteClient.layer({
  filename: Config.succeed("db.sqlite"),
  transformQueryNames: Config.succeed(String.camelToSnake),
  transformResultNames: Config.succeed(String.snakeToCamel),
});

const migrationsPath = path.join(__dirname, "migrations");
const MigratorLive = Sqlite.SqliteMigrator.layer({
  loader: Sqlite.SqliteMigrator.fromFileSystem(migrationsPath),
  schemaDirectory: "src/migrations",
}).pipe(Layer.provide(SqlLive));

export const EnvLive = Layer.mergeAll(SqlLive, MigratorLive).pipe(
  Layer.provide(NodeContext.layer)
);
