const { Model } = require("objection");

class Seat extends Model {
  static get tableName() {
    return "seats";
  }

  static get relationMappings() {
    const Room = require("./room");
    const BookingSeat = require("./bookingseat");
    return {
      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "seats.room_id",
          to: "rooms.id",
        },
      },
      bookingSeats: {
        relation: Model.HasManyRelation,
        modelClass: BookingSeat,
        join: {
          from: "seats.id",
          to: "booking_seat.seat_id",
        },
      },
    };
  }
}

module.exports = Seat;
