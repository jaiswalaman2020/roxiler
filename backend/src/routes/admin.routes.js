const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { ROLES, USER_SORT_FIELDS, STORE_SORT_FIELDS } = require("../constants");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createUserSchema, createStoreSchema } = require("../validators");
const { parseSort, buildLikeFilter, sanitizeUserRow } = require("../utils");

const router = express.Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/dashboard", async (req, res) => {
  const [usersCount, storesCount, ratingsCount] = await Promise.all([
    db.query("SELECT COUNT(*)::INT AS count FROM users"),
    db.query("SELECT COUNT(*)::INT AS count FROM stores"),
    db.query("SELECT COUNT(*)::INT AS count FROM ratings"),
  ]);

  return res.json({
    totalUsers: usersCount.rows[0].count,
    totalStores: storesCount.rows[0].count,
    totalRatings: ratingsCount.rows[0].count,
  });
});

router.post("/users", validate(createUserSchema), async (req, res) => {
  const { name, email, address, password, role } = req.body;

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, hash, address, role],
  );

  return res.status(201).json({ user: sanitizeUserRow(result.rows[0]) });
});

router.post("/stores", validate(createStoreSchema), async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  if (ownerId) {
    const owner = await db.query("SELECT id, role FROM users WHERE id = $1", [
      ownerId,
    ]);
    if (owner.rowCount === 0) {
      return res.status(404).json({ message: "Owner user not found" });
    }
    if (owner.rows[0].role !== ROLES.OWNER) {
      return res
        .status(400)
        .json({ message: "Assigned owner must have OWNER role" });
    }
  }

  const existingEmail = await db.query(
    "SELECT id FROM stores WHERE email = $1",
    [email],
  );
  if (existingEmail.rowCount > 0) {
    return res.status(409).json({ message: "Store email already exists" });
  }

  const result = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
    [name, email, address, ownerId || null],
  );

  return res.status(201).json({ store: result.rows[0] });
});

router.get("/stores", async (req, res) => {
  const {
    name,
    email,
    address,
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;

  const { field, order } = parseSort(
    sortBy,
    sortOrder,
    STORE_SORT_FIELDS,
    "name",
  );

  const clauses = [];
  const values = [];

  const nameLike = buildLikeFilter(name);
  const emailLike = buildLikeFilter(email);
  const addressLike = buildLikeFilter(address);

  if (nameLike) {
    values.push(nameLike);
    clauses.push(`s.name ILIKE $${values.length}`);
  }
  if (emailLike) {
    values.push(emailLike);
    clauses.push(`s.email ILIKE $${values.length}`);
  }
  if (addressLike) {
    values.push(addressLike);
    clauses.push(`s.address ILIKE $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderExpr =
    field === "overall_rating" ? "overall_rating" : `s.${field}`;

  const query = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY ${orderExpr} ${order}
  `;

  const result = await db.query(query, values);
  return res.json({ stores: result.rows });
});

router.get("/users", async (req, res) => {
  const {
    name,
    email,
    address,
    role,
    includeOwners = "true",
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;

  const { field, order } = parseSort(
    sortBy,
    sortOrder,
    USER_SORT_FIELDS,
    "name",
  );
  const clauses = [];
  const values = [];

  const nameLike = buildLikeFilter(name);
  const emailLike = buildLikeFilter(email);
  const addressLike = buildLikeFilter(address);

  if (nameLike) {
    values.push(nameLike);
    clauses.push(`name ILIKE $${values.length}`);
  }
  if (emailLike) {
    values.push(emailLike);
    clauses.push(`email ILIKE $${values.length}`);
  }
  if (addressLike) {
    values.push(addressLike);
    clauses.push(`address ILIKE $${values.length}`);
  }
  if (role) {
    values.push(role);
    clauses.push(`role = $${values.length}`);
  }
  if (includeOwners !== "true") {
    clauses.push(`role IN ('ADMIN', 'USER')`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const query = `SELECT id, name, email, address, role, created_at FROM users ${where} ORDER BY ${field} ${order}`;
  const result = await db.query(query, values);

  return res.json({ users: result.rows.map(sanitizeUserRow) });
});

router.get("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const userResult = await db.query(
    "SELECT id, name, email, address, role, created_at FROM users WHERE id = $1",
    [userId],
  );

  if (userResult.rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = userResult.rows[0];

  if (user.role === ROLES.OWNER) {
    const ownerRating = await db.query(
      `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1`,
      [userId],
    );

    return res.json({
      user: {
        ...sanitizeUserRow(user),
        rating: Number(ownerRating.rows[0].rating),
      },
    });
  }

  return res.json({ user: sanitizeUserRow(user) });
});

module.exports = router;
