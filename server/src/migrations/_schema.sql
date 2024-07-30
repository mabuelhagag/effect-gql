CREATE TABLE IF NOT EXISTS "effect_sql_migrations" (
  migration_id integer PRIMARY KEY NOT NULL,
  created_at datetime NOT NULL DEFAULT current_timestamp,
  name VARCHAR(255) NOT NULL
);
CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(255) NOT NULL,
        "status" TEXT CHECK(status IN ('COMPLETED', 'ACTIVE')) DEFAULT 'ACTIVE',
        created_at datetime NOT NULL DEFAULT current_timestamp
    );

INSERT INTO effect_sql_migrations VALUES(1,'2024-07-18 16:18:17','create_todos');
INSERT INTO effect_sql_migrations VALUES(2,'2024-07-18 16:18:17','add_todos');