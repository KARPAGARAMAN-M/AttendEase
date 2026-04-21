export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  const status = Number(error?.status) || 500;
  const message = error?.message || "Internal server error";
  if (status >= 500) {
    // Keep stack traces in server logs only.
    // eslint-disable-next-line no-console
    console.error(error);
  }
  res.status(status).json({ message });
}
