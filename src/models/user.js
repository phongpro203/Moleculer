const BaseModel = require("./baseModel");

class User extends BaseModel {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "ten"],
      properties: {
        id: { type: "integer" },
        email: { type: "string", format: "email" },
        ten: { type: "string" },
        password: { type: "string" },
      },
    };
  }
}

module.exports = User;
