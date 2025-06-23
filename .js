const today = new Date(); // Hoặc dayjs().startOf('day') nếu bạn dùng dayjs
const isNowShowing = true; // Hoặc false tuỳ người dùng

const movies = await Movie.query()
  .joinRelated("[movieCinemas, showTimes.bookings.bookingSeats]")
  .where("movieCinemas.cinema_id", cinemaId)

  .modify((qb) => {
    if (isNowShowing) {
      qb.where("movies.release_date", "<=", today).whereExists(
        ShowTime.query()
          .whereRaw("show_times.movie_id = movies.id")
          .andWhere("show_times.cinema_id", cinemaId)
          .andWhere("show_times.show_date", ">=", today)
      );
    } else {
      qb.where("movies.release_date", ">", today);
    }
  })
  .select(
    "movies.id",
    "movies.title",
    "movies.duration",
    "movies.genre",
    "movies.poster"
  )
  .select(
    Movie.relatedQuery("showTimes")
      .alias("st")
      .where("st.cinema_id", cinemaId)
      .joinRelated("bookings.bookingSeats")
      .count("bookings:bookingSeats.id as total_bookings")
      .as("total_bookings")
  )
  .orderBy("total_bookings", "desc");
