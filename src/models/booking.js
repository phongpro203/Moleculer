const { Model } = require("objection");

class Booking extends Model {
  static get tableName() {
    return "booking";
  }

  static get relationMappings() {
    const BookingSeat = require("./bookingseat");
    const Seat = require("./seat");
    return {
      BookingSeat: {
        relation: Model.HasManyRelation, //
        modelClass: BookingSeat,
        join: {
          from: "booking.id",
          to: "booking_seat.booking_id",
        },
      },
      seats: {
        relation: Model.ManyToManyRelation,
        modelClass: Seat,
        join: {
          from: "booking.id",
          through: {
            from: "booking_seat.booking_id",
            to: "booking_seat.seat_id",
            extra: ["price"],
          },
          to: "seats.id",
        },
      },
    };
  }
}

module.exports = Booking;
