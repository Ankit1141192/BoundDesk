const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { prisma } = require("../config/db");
const crypto = require("crypto");

// Signup
const SignupControllers = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "USER" },
    });

    res.json({ msg: "User Registered Successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Login
const LoginControllers = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ msg: "Login Successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Forgot Password
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store hashed token in DB
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetExpires: new Date(Date.now() + 3600 * 1000), // 1 hour expiry
      },
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"BoundDesk CRM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <small style="color: #888;">This link expires in 1 hour.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "Password reset email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Reset Password
const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ msg: "Invalid request" });

    // Find user with non-expired reset token
    const users = await prisma.user.findMany({
      where: { resetExpires: { gte: new Date() }, resetToken: { not: null } },
    });

    let user = null;
    for (let u of users) {
      const isValid = await bcrypt.compare(token, u.resetToken);
      if (isValid) {
        user = u;
        break;
      }
    }

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetExpires: null },
    });

    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = {
  SignupControllers,
  LoginControllers,
  ForgotPassword,
  ResetPassword,
};
