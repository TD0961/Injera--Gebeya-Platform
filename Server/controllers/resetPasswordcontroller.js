const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const resetPassword = async (req, res) => {
  const { token } = req.params; // Extract token from URL
  const { password } = req.body; // Extract new password from request body

  try {
    // Hash the token and find the user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { resetPassword };