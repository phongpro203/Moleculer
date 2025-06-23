const { Model } = require("objection");

class Room extends Model {
  static get tableName() {
    return "rooms";
  }

  static get relationMappings() {
    const Showtime = require("./showtime");
    const Seat = require("./seat");

    return {
      showtimes: {
        relation: Model.HasManyRelation,
        modelClass: Showtime,
        join: {
          from: "rooms.id",
          to: "showtimes.room_id",
        },
      },
      seats: {
        relation: Model.HasManyRelation,
        modelClass: Seat,
        join: {
          from: "rooms.id",
          to: "seats.room_id",
        },
      },
    };
  }
}

module.exports = Room;
