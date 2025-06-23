module.exports = {
  nodeID: "node-user",
  transporter: {
    type: "Redis",
    options: {
      host: "localhost", // Hoặc "redis" nếu dùng Docker và cùng mạng
      port: 6379,
    },
  },
  logger: true,
};
