const Validator = require("fastest-validator");
const v = new Validator();

const schema = {
  email: { type: "email", messages: { email: "Email không hợp lệ" } },
  password: {
    type: "string",
    min: 6,
    messages: { stringMin: "Mật khẩu phải có ít nhất 6 ký tự" },
  },
  ten: {
    type: "string",
    min: 1,
    custom(value) {
      const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;
      if (!nameRegex.test(value)) {
        return [
          { type: "invalidName", actual: value, message: "Tên không hợp lệ" },
        ];
      }
      return true;
    },
  },
};

const validateUser = v.compile(schema);

module.exports = validateUser;
