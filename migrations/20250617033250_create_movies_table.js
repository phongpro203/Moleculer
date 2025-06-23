exports.up = function (knex) {
  return knex.schema.createTable("movies", (table) => {
    table.increments("id").primary(); // ID tự tăng
    table.string("title").notNullable(); // Tên phim
    table.text("description"); // Mô tả phim
    table.string("genre"); // Thể loại
    table.integer("duration").notNullable(); // Thời lượng phim (phút)
    table.date("release_date"); // Ngày phát hành
    table.timestamps(true, true); // Thời gian tạo và cập nhật
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("movies");
};
