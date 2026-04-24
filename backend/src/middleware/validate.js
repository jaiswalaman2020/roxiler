function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => issue.message),
      });
    }
    req.body = parsed.data;
    return next();
  };
}

module.exports = { validate };
