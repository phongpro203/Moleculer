const Booking = require("../models/booking");
const { Errors } = require("moleculer");
const BookingSeat = require("../models/bookingseat");

module.exports = {
  name: "booking",
  actions: {
    getById: {
      params: {
        id: "string",
      },
      async handler(ctx) {
        const { id } = ctx.params;
        const booking = await Booking.query()
          .findById(id)
          .select("booking.id", "booking.total_price")
          .withGraphJoined("seats")
          .modifyGraph("seats", (builder) => {
            builder.select("id", "seat_number", "is_vip");
          });

        if (!booking)
          throw new Errors.MoleculerError(
            "Entity not found",
            404,
            "ENTITY_NOT_FOUND",
            { id }
          );
        return booking;
      },
    },
    create: {
      params: {
        seats: "array",
      },
      async handler(ctx) {
        const { seats } = ctx.params;
        const totalPrice = seats.reduce((total, seat) => total + seat.price, 0);
        const bookingGraph = {
          user_id: 1,
          total_price: totalPrice,
          showtime_id: 1,
          seats: seats,
        };
        const booking = await Booking.query().insertGraph(bookingGraph, {
          relate: ["seats"],
        });
        return booking;
      },
    },
  },
};
