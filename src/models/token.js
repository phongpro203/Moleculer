const BaseModel = require("./baseModel");

class Token extends BaseModel {
  static get tableName() {
    return "tokens";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "refresh_token", "expires_at"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        access_token: { type: ["string", "null"] },
        refresh_token: { type: "string" },
        expires_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./user");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tokens.user_id",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = Token;
