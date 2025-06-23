// index.js
require("dotenv").config();
const { ServiceBroker } = require("moleculer");
const broker = new ServiceBroker(require("./moleculer.config"));

// Load service
broker.loadService("./src/services/user.service");
broker.loadService("./src/services/email.service");
broker.loadService("./src/services/auth.service");

broker.loadService("./src/services-2/movie.service");
broker.loadService("./src/services-2/showtime.service");
broker.loadService("./src/services-2/room.service");
broker.loadService("./src/services-2/booking.service");

broker.loadService("./src/gateway.service");

// Start broker
broker.start().then(() => {
  broker.logger.info("Moleculer broker started!");
});
