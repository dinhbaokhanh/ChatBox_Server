import { compare } from 'bcrypt'
import { User } from '../models/user.js'
import { Request } from '../models/request.js'
import { Chat } from '../models/chat.js'
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from '../utils/features.js'
import { TryCatch } from '../middlewares/error.js'
import { ErrorHandler } from '../utils/utility.js'
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js'
import { getOtherMember } from '../lib/helper.js'

const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, description } = req.body

  const file = req.file

  if (!file) return next(new ErrorHandler('Please Upload Avatar'))

  const result = await uploadFilesToCloudinary([file])

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  }

  const user = await User.create({
    name,
    username,
    password,
    description,
    avatar,
  })

  sendToken(res, user, 201, 'User created')
})

const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body

  const user = await User.findOne({ username }).select('+password')

  if (!user) return next(new ErrorHandler('Username not found or Invalid', 404))

  const isMatch = await compare(password, user.password)

  if (!isMatch) return next(new ErrorHandler('Invalid password', 404))

  sendToken(res, user, 200, `${username} logged in`)
})

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user)

  if (!user) return next(new ErrorHandler('User not found', 404))

  res.status(200).json({
    success: true,
    user,
  })
})

const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie('token', '', { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: 'Logged out !!',
    })
})

const searchUser = TryCatch(async (req, res) => {
  const { name = '' } = req.query

  const myChats = await User.find({
    groupChat: false,
    members: req.user,
  })

  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members)

  const allUsersExceptFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: 'i' },
  })

  const users = allUsersExceptFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar,
  }))

  return res.status(200).json({
    success: true,
    users,
  })
})

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  })

  if (userId === req.user) {
    return next(
      new ErrorHandler('You cannot send a friend request to yourself', 400)
    )
  }

  if (request) return next(new ErrorHandler('Request has already sent', 400))

  await Request.create({
    sender: req.user,
    receiver: userId,
  })

  emitEvent(req, NEW_REQUEST, [userId])

  return res.status(200).json({
    success: true,
    message: 'Friend Request Sent',
  })
})

const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body
  const request = await Request.findById(requestId)
    .populate('sender', 'name')
    .populate('receiver', 'name')

  if (!request) return next(new ErrorHandler('Request not found', 404))

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler('You are not authorized to accept this request', 404)
    )

  if (!accept) {
    await request.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Friend Request Rejected',
    })
  }

  const members = [request.sender._id, request.receiver._id]

  await Promise.all([
    Chat.create({
      members,
      name: `${request.receiver.name} - ${request.sender.name}`,
      groupChat: false,
    }),
    request.deleteOne(),
  ])

  emitEvent(req, REFETCH_CHATS, members)

  return res.status(200).json({
    success: true,
    message: 'Friend Request Accepted',
    senderId: request.sender._id,
  })
})

const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    'sender',
    'name avatar'
  )

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar,
    },
  }))

  return res.status(200).json({
    success: true,
    requests: allRequests,
  })
})

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate('members', 'name avatar')

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user)

    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar,
    }
  })

  if (chatId) {
    const chat = await Chat.findById(chatId)

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    )

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    })
  } else {
    return res.status(200).json({
      success: true,
      friends,
    })
  }
})

export {
  login,
  newUser,
  getMyProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  getMyNotifications,
  getMyFriends,
}
