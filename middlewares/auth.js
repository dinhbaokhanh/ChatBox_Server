import jwt from 'jsonwebtoken'
import { adminSecretKey } from '../app.js'
import { ErrorHandler } from '../utils/utility.js'
import { TryCatch } from './error.js'
import { TOKEN } from '../constants/config.js'
import { User } from '../models/user.js'

const isAuthenticated = TryCatch((req, res, next) => {
  const token = req.cookies[TOKEN]

  if (!token) {
    return next(new ErrorHandler('Please login', 401))
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET)

  req.user = decodedData._id

  next()
})

const adminAuth = TryCatch((req, res, next) => {
  const token = req.cookies['admin-token']

  if (!token) {
    return next(new ErrorHandler('Please login as ADMIN', 401))
  }

  const secretKey = jwt.verify(token, process.env.JWT_SECRET)
  const isMatch = secretKey === adminSecretKey

  if (!isMatch) return next(new ErrorHandler('Invalid Admin Key', 401))

  next()
})

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err)
    const authToken = socket.request.cookies[TOKEN]

    if (!authToken) return next(new ErrorHandler('Please login'))

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET)

    const user = await User.findById(decodedData._id)

    if (!user) return next(new ErrorHandler('Please login', 401))

    socket.user = user

    return next()
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler('Please login', 401))
  }
}

export { isAuthenticated, adminAuth, socketAuthenticator }
