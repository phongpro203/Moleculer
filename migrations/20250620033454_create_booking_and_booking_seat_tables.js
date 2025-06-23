exports.up = function (knex) {
  return knex.schema
    .createTable("booking", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.integer("total_price").defaultTo(0);
      table.timestamps(true, true);
    })

    .createTable("booking_seat", function (table) {
      table.increments("id").primary();
      table
        .integer("booking_id")
        .unsigned()
        .references("id")
        .inTable("booking")
        .onDelete("CASCADE");
      table
        .integer("seat_id")
        .unsigned()
        .references("id")
        .inTable("seats")
        .onDelete("SET NULL");
      table.integer("price").defaultTo(0);
      table.timestamps(true, true); // Thêm cột created_at và updated_at
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("booking_seat")
    .dropTableIfExists("booking");
};
