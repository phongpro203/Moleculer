exports.up = function (knex) {
  return knex.schema.createTable("showtimes", (table) => {
    table.increments("id").primary(); // ID tự tăng
    table.integer("movie_id").unsigned().notNullable(); // ID phim
    table.integer("room_id").unsigned().notNullable(); // ID phòng chiếu
    table.datetime("start_time").notNullable(); // Thời gian bắt đầu chiếu
    // Khóa ngoại
    table
      .foreign("movie_id")
      .references("id")
      .inTable("movies")
      .onDelete("CASCADE");
    table
      .foreign("room_id")
      .references("id")
      .inTable("rooms")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("showtimes");
};
