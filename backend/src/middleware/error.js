function notFound(req, res) {
  return res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: "Internal server error" });
}

module.exports = {
  notFound,
  errorHandler,
};
