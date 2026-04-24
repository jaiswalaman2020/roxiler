function parseSort(sortBy, sortOrder, allowedFields, defaultField) {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order =
    String(sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
  return { field, order };
}

function buildLikeFilter(value) {
  if (!value) return null;
  return `%${value.trim()}%`;
}

function sanitizeUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    createdAt: row.created_at,
  };
}

module.exports = {
  parseSort,
  buildLikeFilter,
  sanitizeUserRow,
};
