const User = require("../models/user");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
  name: "user",

  actions: {
    getAll: {
      async handler(ctx) {
        return await User.query();
      },
    },
    create: {
      params: {
        ten: "string",
        email: "email",
        password: "string",
      },
      async handler(ctx) {
        return await User.query().insert(ctx.params);
      },
    },
    update: {
      params: {
        id: "string",
        name: { type: "string", optional: true },
        email: { type: "string", optional: true },
        password: { type: "string", optional: true },
      },
      async handler(ctx) {
        try {
          const { id, ...data } = ctx.params;
          return await User.query().patchAndFetchById(id, data);
        } catch (err) {
          ctx.meta.$statusCode = 500;
          throw new MoleculerError("Lỗi cập nhật", 500, "UPDATE_ERROR", {
            cause: err.message,
          });
        }
      },
    },
    delete: {
      params: {
        id: "string",
      },
      async handler(ctx) {
        const count = await User.query().deleteById(ctx.params.id);
        return { deleted: count > 0 };
      },
    },
    sendMailScheduler: {
      params: {
        to: "string",
        subject: "string",
        text: "string",
        sendAt: "string",
      },
      async handler(ctx) {
        const { to, subject, text, sendAt } = ctx.params;
        //validate
        const sendAtDate = new Date(sendAt);
        if (isNaN(sendAtDate.getTime())) {
          throw new Error("Invalid sendAt date");
        }

        const delay = sendAtDate.getTime() - Date.now();
        if (delay < 0) {
          throw new Error("sendAt must be a future time");
        }
        //thực hiện gọi service để gửi mail
        await ctx.call("email.sendMail", { to, subject, text, sendAt });
        return { message: "Email sent successfully" };
      },
    },
  },
};
