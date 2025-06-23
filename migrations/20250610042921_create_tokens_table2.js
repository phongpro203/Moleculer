/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tokens", function (table) {
    table.increments("id").primary(); // id SERIAL
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // FOREIGN KEY user_id
    table.text("access_token"); // có thể để null
    table.text("refresh_token").notNullable();
    table.timestamp("expires_at").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tokens");
};
