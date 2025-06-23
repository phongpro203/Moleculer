const Room = require("../models/room");

module.exports = {
  name: "room",
  actions: {
    createRoom: {
      params: {
        name: "string",
        capacity: "number",
        seats: "array",
      },
      async handler(ctx) {
        const { name, capacity, seats } = ctx.params;
        const room = await Room.query().insertGraph({
          name,
          capacity,
          seats,
        });
        return room;
      },
    },
    getAll: {
      async handler(ctx) {
        const rooms = await Room.query()
          .select("id", "name", "capacity")
          .withGraphFetched("[seats]")
          .modifyGraph("seats", (builder) => {
            builder.select("id", "seat_number", "is_vip");
          });
        return rooms;
      },
    },
  },
};
