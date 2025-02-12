import { body, validationResult, param } from 'express-validator'
import { ErrorHandler } from '../utils/utility.js'

const validateHandler = (req, res, next) => {
  const errors = validationResult(req)

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(', ')

  if (errors.isEmpty()) return next()
  else next(new ErrorHandler(errorMessages, 400))
}

const registerValidator = () => [
  body('name', 'Please Enter Name').notEmpty(),
  body('username', 'Please Enter Username').notEmpty(),
  body('description', 'Please Enter Description').notEmpty(),
  body('password', 'Please Enter Password').notEmpty(),
]

const loginValidator = () => [
  body('username', 'Please Enter Username').notEmpty(),
  body('password', 'Please Enter Password').notEmpty(),
]

const newGroupValidator = () => [
  body('name', 'Please Enter Group Name').notEmpty(),
  body('members')
    .notEmpty()
    .withMessage('Please Add Members')
    .isArray({ min: 2, max: 100 })
    .withMessage('Number of Group Members must from 3 to 100'),
]

const addMemberValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
  body('members')
    .notEmpty()
    .withMessage('Please Add Members')
    .isArray({ min: 1, max: 97 })
    .withMessage('Num of Mem must > 1'),
]

const removeMemberValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
  body('userId', 'Please Enter User ID').notEmpty(),
]

const sendAttachmentsValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
]

const chatIdValidator = () => [param('id', 'Please Enter Chat ID').notEmpty()]

const renameGroupValidator = () => [
  param('id', 'Please Enter Chat ID').notEmpty(),
  body('name', 'Please Enter New Group Name').notEmpty(),
]

const sendRequestValidator = () => [
  body('userId', 'Please Enter User ID').notEmpty(),
]

const acceptFriendRequestValidator = () => [
  body('requestId', 'Please Enter Request ID').notEmpty(),
  body('accept')
    .notEmpty()
    .withMessage("'Accept Field is missing'")
    .isBoolean()
    .withMessage('Accept is boolean'),
]

const adminLoginValidator = () => [
  body('secretKey', 'Please Enter Request Key').notEmpty(),
]

export {
  registerValidator,
  validateHandler,
  loginValidator,
  newGroupValidator,
  addMemberValidator,
  removeMemberValidator,
  sendAttachmentsValidator,
  chatIdValidator,
  renameGroupValidator,
  sendRequestValidator,
  acceptFriendRequestValidator,
  adminLoginValidator,
}
