// bullboard.js
const express = require("express");
const { ExpressAdapter } = require("@bull-board/express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { emailQueue } = require("./services/queue/mailQueue");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3001, () => {
  console.log("BullBoard UI: http://localhost:3001/admin/queues");
});
