const { Model } = require("objection");

class BookingSeat extends Model {
  static get tableName() {
    return "booking_seat";
  }

  static get relationMappings() {
    const Booking = require("./booking");
    const Seat = require("./seat");
    return {
      booking: {
        relation: Model.BelongsToOneRelation, // Một seat thuộc về một booking
        modelClass: Booking,
        join: {
          from: "booking_seat.booking_id",
          to: "booking.id",
        },
      },
    };
  }
}

module.exports = BookingSeat;
