/** CORS middleware for json-server (browser clients on another origin). */
module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept',
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
};
