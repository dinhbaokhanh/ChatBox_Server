import express from 'express'
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
} from '../controllers/user.js'
import { singleAvatar } from '../middlewares/multer.js'
import { isAuthenticated } from '../middlewares/auth.js'
import {
  acceptFriendRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from '../lib/validator.js'

const router = express.Router()

router.post('/new', singleAvatar, registerValidator(), validateHandler, newUser)
router.post('/login', loginValidator(), validateHandler, login)

router.use(isAuthenticated)

router.get('/myself', getMyProfile)
router.get('/logout', logout)

router.get('/search', searchUser)

router.put(
  '/sendRequest',
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
)

router.put(
  '/acceptFriendRequest',
  acceptFriendRequestValidator(),
  validateHandler,
  acceptFriendRequest
)

router.get('/notifications', getMyNotifications)

router.get('/friends', getMyFriends)

export default router
