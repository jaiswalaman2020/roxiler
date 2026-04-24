const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  OWNER: "OWNER",
};

const USER_SORT_FIELDS = ["name", "email", "address", "role", "created_at"];
const STORE_SORT_FIELDS = [
  "name",
  "email",
  "address",
  "overall_rating",
  "created_at",
];

module.exports = {
  ROLES,
  USER_SORT_FIELDS,
  STORE_SORT_FIELDS,
};
