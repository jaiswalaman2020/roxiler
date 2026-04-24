const express = require("express");
const db = require("../db");
const { ROLES, STORE_SORT_FIELDS } = require("../constants");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { ratingSchema } = require("../validators");
const { parseSort, buildLikeFilter } = require("../utils");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const { name, address, sortBy = "name", sortOrder = "asc" } = req.query;
  const { field, order } = parseSort(
    sortBy,
    sortOrder,
    STORE_SORT_FIELDS,
    "name",
  );

  const clauses = [];
  const values = [req.user.id];

  const nameLike = buildLikeFilter(name);
  const addressLike = buildLikeFilter(address);

  if (nameLike) {
    values.push(nameLike);
    clauses.push(`s.name ILIKE $${values.length}`);
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
      s.address,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
      MAX(CASE WHEN r.user_id = $1 THEN r.rating ELSE NULL END) AS user_submitted_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY ${orderExpr} ${order}
  `;

  const result = await db.query(query, values);

  const stores = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    overallRating: Number(row.overall_rating),
    userSubmittedRating: row.user_submitted_rating
      ? Number(row.user_submitted_rating)
      : null,
  }));

  return res.json({ stores });
});

router.put(
  "/:id/rating",
  requireRole(ROLES.USER),
  validate(ratingSchema),
  async (req, res) => {
    const storeId = Number(req.params.id);
    const { rating } = req.body;

    if (Number.isNaN(storeId)) {
      return res.status(400).json({ message: "Invalid store id" });
    }

    const store = await db.query("SELECT id FROM stores WHERE id = $1", [
      storeId,
    ]);
    if (store.rowCount === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const result = await db.query(
      `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
     RETURNING id, user_id, store_id, rating, updated_at`,
      [req.user.id, storeId, rating],
    );

    return res.json({ rating: result.rows[0] });
  },
);

module.exports = router;
