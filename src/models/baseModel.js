const { Model } = require("objection");
const knex = require("../knex"); // ✅ Correct - direct import

Model.knex(knex);

class BaseModel extends Model {}
module.exports = BaseModel;
