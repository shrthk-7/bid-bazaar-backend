const handleCors = (req, res, next) => {
  const whitelist = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
  ];

  // currently set to accept all origins
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'prod' && whitelist.indexOf(origin) !== -1) {
    return next(new AppError('CORS Error: Origin not allowed', 403));
  }
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header(
      'Access-Control-Allow-Methods',
      'PUT, POST, PATCH, GET, HEAD, OPTIONS, DELETE'
    );
    return res.status(200).json({});
  }
  next();
};

module.exports = handleCors;
