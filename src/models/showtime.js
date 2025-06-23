const { Model } = require("objection");
const BaseModel = require("./baseModel");

class Showtime extends BaseModel {
  static get tableName() {
    return "showtimes";
  }

  static get relationMappings() {
    const Movie = require("./movie");
    const Room = require("./room");

    return {
      movie: {
        relation: Model.BelongsToOneRelation,
        modelClass: Movie,
        join: {
          from: "showtimes.movie_id",
          to: "movies.id",
        },
      },
      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "showtimes.room_id",
          to: "rooms.id",
        },
      },
    };
  }
}

module.exports = Showtime;
