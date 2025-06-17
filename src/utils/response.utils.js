// Success response
exports.successResponse = (res, data = null, statusCode = 200) => {
  const response = {
    status: true,
    ...data
  };

  return res.status(statusCode).json(response);
};

// Error response
exports.errorResponse = (res, message = 'An error occurred', statusCode = 400) => {
  return res.status(statusCode).json({
    status: false,
    message
  });
};
