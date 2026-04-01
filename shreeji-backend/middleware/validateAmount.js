const { isValidAmount } = require("../utils/validators");

const validateAmount = (req, res, next) => {
  const { amount } = req.body || {};

  if (amount !== undefined && !isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount"
    });
  }

  next();
};

module.exports = validateAmount;