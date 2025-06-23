exports.up = function (knex) {
  return knex.schema.createTable("seats", (table) => {
    table.increments("id").primary(); // ID tự tăng
    table.integer("room_id").unsigned().notNullable(); // ID phòng chiếu
    table.string("seat_number").notNullable(); // Số ghế (A1, A2, B1, ...)
    table.boolean("is_vip").defaultTo(false); // Ghế VIP hay không
    table.timestamps(true, true); // Thời gian tạo và cập nhật

    // Khóa ngoại
    table
      .foreign("room_id")
      .references("id")
      .inTable("rooms")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("seats");
};
