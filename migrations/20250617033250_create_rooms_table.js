exports.up = function (knex) {
  return knex.schema.createTable("rooms", (table) => {
    table.increments("id").primary(); // ID tự tăng
    table.string("name").notNullable(); // Tên phòng chiếu
    table.integer("capacity").notNullable(); // Sức chứa (số ghế)
    table.timestamps(true, true); // Thời gian tạo và cập nhật
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("rooms");
};
