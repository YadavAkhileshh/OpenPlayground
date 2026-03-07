const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  getBoards,
  getBoard,
  getBoardByCode,
  createBoard,
  updateBoard,
  saveElements,
  deleteBoard,
  addCollaborator,
  removeCollaborator,
  regenerateShareCode,
  getTemplates,
} = require('../controllers/boardController')

const router = Router()

// Templates (no auth needed)
router.get('/templates', getTemplates)

// Boards CRUD
router.get('/', auth, getBoards)
router.post('/', auth, createBoard)
router.get('/code/:code', auth, getBoardByCode)
router.get('/:id', auth, getBoard)
router.put('/:id', auth, updateBoard)
router.put('/:id/elements', auth, saveElements)
router.delete('/:id', auth, deleteBoard)

// Collaborators
router.post('/:id/collaborators', auth, addCollaborator)
router.delete('/:id/collaborators/:userId', auth, removeCollaborator)

// Share
router.post('/:id/share-code', auth, regenerateShareCode)

module.exports = router
