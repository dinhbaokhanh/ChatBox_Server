import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js'
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMembers,
  renameGroup,
  sendAttachments,
} from '../controllers/chat.js'
import { attachmentsMulter } from '../middlewares/multer.js'
import {
  addMemberValidator,
  newGroupValidator,
  removeMemberValidator,
  validateHandler,
  sendAttachmentsValidator,
  chatIdValidator,
  renameGroupValidator,
} from '../lib/validator.js'

const router = express.Router()

router.use(isAuthenticated)

// CRUD Groups & Members
router.post('/new', newGroupValidator(), validateHandler, newGroupChat)

router.get('/personal/', getMyChats)

router.get('/personal/groups', getMyGroups)

router.put('/add', addMemberValidator(), validateHandler, addMembers)

router.put('/remove', removeMemberValidator(), validateHandler, removeMembers)

router.delete('/leave/:id', chatIdValidator(), validateHandler, leaveGroup)

// Attachments
router.post(
  '/message',
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
)

// Get Messages
router.get('/message/:id', chatIdValidator(), validateHandler, getMessages)

// Chat
router
  .route('/:id')
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameGroupValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat)

export default router
