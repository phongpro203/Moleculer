const { Model } = require("objection");

class Movie extends Model {
  static get tableName() {
    return "movies";
  }

  static get relationMappings() {
    const Showtime = require("./showtime");

    return {
      showtimes: {
        relation: Model.HasManyRelation,
        modelClass: Showtime,
        join: {
          from: "movies.id",
          to: "showtimes.movie_id",
        },
      },
    };
  }
}

module.exports = Movie;
