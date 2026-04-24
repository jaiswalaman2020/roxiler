const express = require("express");
const db = require("../db");
const { ROLES } = require("../constants");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole(ROLES.OWNER));

router.get("/dashboard", async (req, res) => {
  const storeResult = await db.query(
    `SELECT id, name FROM stores WHERE owner_id = $1 LIMIT 1`,
    [req.user.id],
  );

  if (storeResult.rowCount === 0) {
    return res.json({
      store: null,
      averageRating: 0,
      submittedRatings: [],
    });
  }

  const store = storeResult.rows[0];

  const [averageResult, usersResult] = await Promise.all([
    db.query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average_rating
       FROM ratings
       WHERE store_id = $1`,
      [store.id],
    ),
    db.query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id],
    ),
  ]);

  return res.json({
    store,
    averageRating: Number(averageResult.rows[0].average_rating),
    submittedRatings: usersResult.rows,
  });
});

module.exports = router;
