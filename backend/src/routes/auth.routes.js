const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { ROLES } = require("../constants");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
} = require("../validators");
const { sanitizeUserRow } = require("../utils");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

router.post("/signup", validate(signupSchema), async (req, res) => {
  const { name, email, address, password } = req.body;

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, passwordHash, address, ROLES.USER],
  );

  const user = result.rows[0];
  const token = createToken(user);
  return res.status(201).json({ token, user: sanitizeUserRow(user) });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query(
    "SELECT id, name, email, address, role, password_hash, created_at FROM users WHERE email = $1",
    [email],
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken(user);
  return res.json({ token, user: sanitizeUserRow(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, address, role, created_at FROM users WHERE id = $1",
    [req.user.id],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: sanitizeUserRow(result.rows[0]) });
});

router.put(
  "/update-password",
  requireAuth,
  validate(updatePasswordSchema),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await db.query(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      req.user.id,
    ]);

    return res.json({ message: "Password updated successfully" });
  },
);

module.exports = router;
