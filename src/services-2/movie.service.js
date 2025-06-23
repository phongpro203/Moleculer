const { raw } = require("objection");
const Movie = require("../models/movie");

module.exports = {
  name: "movie",
  actions: {
    getAll: {
      async handler(ctx) {
        const is_showing = false;
        // const movies = await Movie.query()
        //   .select("id", "title", "description", "duration", "release_date")
        //   .where("release_date", is_showing ? "<=" : ">", "2025-8-1")
        //   .withGraphFetched("[showtimes]")
        //   .modifyGraph("showtimes", (builder) => {
        //     builder
        //       .select("showtimes.id", "showtimes.start_time")
        //       .select(
        //         raw(
        //           `showtimes.start_time + interval '1 minute' * movie.duration as end_time`
        //         )
        //       )

        //       .joinRelated("movie");
        //   });

        // const movies = Movie.query()
        //   .select(
        //     "movies.id",
        //     "movies.title",
        //     "movies.duration",
        //     "showtimes:end_time"
        //   )
        //   .withGraphJoined("showtimes")
        //   .where("showtimes.id", ">", 3)
        //   .modifyGraph("showtimes", (builder) => {
        //     builder.joinRelated("movie");
        //     builder.select(
        //       "showtimes.id",
        //       "showtimes.start_time",
        //       raw(
        //         `showtimes.start_time + interval '1 minute' * movie.duration as "showtimes:end_time"`
        //       )
        //     );
        //   });

        const movies = await Movie.query().select(
          "id",
          "title",
          "description",
          "duration",
          "release_date",
          raw(`(
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'id', s.id,
                  'start_time', s.start_time,
                  'end_time', s.start_time + interval '1 minute' * movies.duration
                )
              ),
              '[]'::json
            )
            FROM showtimes s
            WHERE s.movie_id = movies.id
          ) as showtimes`)
        );
        return movies;
      },
    },
  },
};
