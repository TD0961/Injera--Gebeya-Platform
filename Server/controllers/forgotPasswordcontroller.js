const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found. Please use the email you registered with." });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
    await user.save();

    // Create the reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email credentials from .env
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"Injera Gebeya" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.status(200).json({ message: "Check your email for the password reset link." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

module.exports = { forgotPassword };