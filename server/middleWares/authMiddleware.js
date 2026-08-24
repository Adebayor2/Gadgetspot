const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7)
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

const optionalProtect = (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) return next()

  try {
    req.user = jwt.verify(authorization.slice(7), process.env.JWT_SECRET)
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  return next()
}

module.exports = protect
module.exports.optionalProtect = optionalProtect
