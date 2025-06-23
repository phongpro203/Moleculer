const sendMail = require("../helpers/sendMail");
const { scheduleEmail } = require("./queue/mailQueue");

module.exports = {
  name: "email",
  actions: {
    sendMail: {
      params: {
        to: "string",
        subject: "string",
        text: "string",
        sendAt: "string",
      },
      async handler(ctx) {
        const { to, subject, text, sendAt } = ctx.params;
        const sendAtDate = new Date(sendAt);
        if (isNaN(sendAtDate.getTime())) {
          throw new Error("Invalid sendAt date");
        }

        const delay = sendAtDate.getTime() - Date.now();
        if (delay < 0) {
          throw new Error("sendAt must be a future time");
        }
        await scheduleEmail({ to, subject, text, sendAt: sendAtDate });
        return {
          message: `Email to ${to} scheduled at ${sendAtDate.toISOString()}`,
        };
      },
    },
    sendVerifyEmail: {
      params: {
        email: "string",
        url: "string",
      },
      async handler(ctx) {
        const { email, url } = ctx.params;
        const to = email;
        const subject = "Xác minh tài khoản";
        const html = `Vui lòng click vào <a href="${url}">đây</a> để xác thực tài khoản.`;
        await sendMail(to, subject, (text = null), html);
        return;
      },
    },
  },
};
