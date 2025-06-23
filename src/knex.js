const Knex = require("knex"); // Import Knex
const { Model } = require("objection"); // Import Objection.js
const knexConfig = require("../knexfile"); // Import cấu hình Knex

// Khởi tạo Knex với cấu hình development
const knex = Knex(knexConfig.development);
console.log(knexConfig);

// Liên kết Objection.js với Knex
Model.knex(knex);

module.exports = knex; // Xuất đối tượng Knex để sử dụng ở nơi khác
