const { methods } = require("../gateway.service");
const Seat = require("../models/seat");
const Showtime = require("../models/showtime");
const { raw } = require("objection");

module.exports = {
  name: "showtime",
  actions: {
    getAll: {
      async handler(ctx) {
        // const showtime = await Showtime.query()
        //   .select(
        //     "showtimes.id",
        //     "showtimes.start_time",
        //     "showtimes.room_id",
        //     "movie.title as movie_name",
        //     raw(
        //       `showtimes.start_time + interval '1 minute' * movie.duration as end_time`
        //     )
        //   )
        //   .withGraphJoined("[movie]")
        //   .modifyGraph("movie", (builder) => {
        //     builder.select(
        //       "id",
        //       "title",
        //       "description",
        //       "duration",
        //       "release_date"
        //     );
        //   });

        //Tách riêng seat và showtime
        const showtime = await Showtime.query()
          .select(
            "showtimes.id",
            "showtimes.start_time",
            "showtimes.room_id",
            "movie.title as movie_name",
            raw(
              `showtimes.start_time + interval '1 minute' * movie.duration as end_time`
            )
          )
          .findById(3)
          .withGraphJoined("[movie]")
          .modifyGraph("movie", (builder) => {
            builder.select(
              "id",
              "title",
              "description",
              "duration",
              "release_date"
            );
          });
        const seats = await Seat.query()
          .select(
            "seats.id",
            "seats.room_id",
            "seats.seat_number",
            "seats.is_vip",
            raw(
              `
               CASE WHEN EXISTS (
                SELECT 1 
                FROM booking_seat 
                JOIN booking ON booking.id = booking_seat.booking_id 
                WHERE booking_seat.seat_id = seats.id 
                AND booking.showtime_id = ?
              ) THEN false ELSE true END as available
              `,
              showtime.id
            )
          )
          .where("seats.room_id", showtime.room_id);

        //Sử dụng withGraphFetch sau đó dùng js format lại
        const showtimeId = 1;
        const result = await Showtime.query()
          .findById(showtimeId)
          .withGraphFetched("[movie, room.[seats]]")
          .modifyGraph("room.seats", (builder) => {
            builder.select("id", "seat_number").select(
              raw(
                `(CASE WHEN EXISTS (
          SELECT 1 
          FROM booking_seat AS bs
          JOIN booking AS b ON bs.booking_id = b.id
          WHERE bs.seat_id = seats.id AND b.showtime_id = ?
        ) THEN FALSE ELSE TRUE END) AS available`,
                [showtimeId]
              )
            );
          })
          .select("id", "start_time");

        //Sử dụng withgraphjoin sau đó format lại bằng js
        const showtimes = await Showtime.query()
          .findById(showtimeId)
          .select(
            "showtimes.id",
            "showtimes.start_time",
            "room:seats:available"
          )
          .withGraphJoined("[movie, room.[seats]]")
          .modifyGraph("room.seats", (builder) => {
            builder.select("id", "seat_number").select(
              raw(
                `(CASE WHEN EXISTS (
                  SELECT 1 
                  FROM booking_seat AS bs
                  JOIN booking AS b ON bs.booking_id = b.id
                  WHERE bs.seat_id = seats.id AND b.showtime_id = ?
                ) THEN FALSE ELSE TRUE END) AS "room:seats:available"`,
                [showtimeId]
              )
            );
          });
        const formattedShowtime = this.formatShowtime(showtimes);
        return {
          formattedShowtime,
        };
      },
    },
    create: {
      handler(ctx) {
        const showTime = {
          movie_id: 1,
          room_id: 1,
          start_time: new Date(),
        };
        return Showtime.query().insert(showTime);
      },
    },
  },
  methods: {
    // Method để xử lý định dạng dữ liệu showTime
    formatShowtime(showTime) {
      if (!showTime) {
        return null;
      }

      return {
        id: showTime.id,
        startTime: showTime.start_time,
        endTime: new Date(
          showTime.start_time.getTime() + showTime.movie.duration * 60000
        ),
        movie: {
          id: showTime.movie.id,
          title: showTime.movie.title,
          duration: showTime.movie.duration,
        },
        roomName: showTime.room.name,
        seats: showTime.room.seats.map((seat) => {
          return {
            id: seat.id,
            seatNumber: seat.seat_number,
            isVip: seat.is_vip,
            available: seat.available,
          };
        }),
      };
    },
  },
};
