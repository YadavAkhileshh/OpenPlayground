const Board = require('../models/Board')
const { generateShareCode } = require('../utils/helpers')

// ── List user's boards ────────────────────────────
const getBoards = async (req, res, next) => {
  try {
    const { search, sort = 'updatedAt' } = req.query

    const query = {
      $or: [{ owner: req.userId }, { 'collaborators.user': req.userId }],
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }

    const sortMap = {
      updatedAt: { updatedAt: -1 },
      createdAt: { createdAt: -1 },
      title: { title: 1 },
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email avatar color')
      .populate('collaborators.user', 'name email avatar color')
      .select('-elements')
      .sort(sortMap[sort] || { updatedAt: -1 })
      .lean()

    res.json({ boards })
  } catch (err) {
    next(err)
  }
}

// ── Get single board ──────────────────────────────
const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar color')
      .populate('collaborators.user', 'name email avatar color')

    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (!board.canView(req.userId)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ board })
  } catch (err) {
    next(err)
  }
}

// ── Get board by share code ───────────────────────
const getBoardByCode = async (req, res, next) => {
  try {
    const board = await Board.findOne({ shareCode: req.params.code })
      .populate('owner', 'name email avatar color')
      .populate('collaborators.user', 'name email avatar color')

    if (!board) return res.status(404).json({ message: 'Board not found' })

    res.json({ board })
  } catch (err) {
    next(err)
  }
}

// ── Create board ──────────────────────────────────
const createBoard = async (req, res, next) => {
  try {
    const { title, background, template, isPublic } = req.body

    const board = await Board.create({
      title: title || 'Untitled Board',
      owner: req.userId,
      background: background || '#ffffff',
      template: template || null,
      isPublic: isPublic || false,
      shareCode: generateShareCode(),
      elements: [],
    })

    await board.populate('owner', 'name email avatar color')

    res.status(201).json({ board })
  } catch (err) {
    next(err)
  }
}

// ── Update board metadata ─────────────────────────
const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can update board settings' })
    }

    const allowed = ['title', 'background', 'isPublic', 'tags', 'thumbnail']
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) board[key] = req.body[key]
    })

    await board.save()
    res.json({ board })
  } catch (err) {
    next(err)
  }
}

// ── Save board elements (bulk) ────────────────────
const saveElements = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (!board.canEdit(req.userId)) {
      return res.status(403).json({ message: 'Edit access denied' })
    }

    board.elements = req.body.elements || []
    if (req.body.viewport) board.viewport = req.body.viewport
    await board.save()

    res.json({ message: 'Board saved', elementCount: board.elements.length })
  } catch (err) {
    next(err)
  }
}

// ── Delete board ──────────────────────────────────
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can delete a board' })
    }

    await board.deleteOne()
    res.json({ message: 'Board deleted' })
  } catch (err) {
    next(err)
  }
}

// ── Share / collaborators ─────────────────────────
const addCollaborator = async (req, res, next) => {
  try {
    const { userId, role } = req.body
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can manage collaborators' })
    }

    const existing = board.collaborators.find((c) => c.user.toString() === userId)
    if (existing) {
      existing.role = role || 'editor'
    } else {
      board.collaborators.push({ user: userId, role: role || 'editor' })
    }

    await board.save()
    await board.populate('collaborators.user', 'name email avatar color')
    res.json({ collaborators: board.collaborators })
  } catch (err) {
    next(err)
  }
}

const removeCollaborator = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can manage collaborators' })
    }

    board.collaborators = board.collaborators.filter(
      (c) => c.user.toString() !== req.params.userId,
    )
    await board.save()
    res.json({ collaborators: board.collaborators })
  } catch (err) {
    next(err)
  }
}

// ── Regenerate share code ─────────────────────────
const regenerateShareCode = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
    if (!board) return res.status(404).json({ message: 'Board not found' })
    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can regenerate the share code' })
    }

    board.shareCode = generateShareCode()
    await board.save()
    res.json({ shareCode: board.shareCode })
  } catch (err) {
    next(err)
  }
}

// ── Templates ─────────────────────────────────────
const getTemplates = async (_req, res) => {
  const templates = [
    {
      id: 'blank',
      title: 'Blank Board',
      description: 'Start from scratch',
      thumbnail: '',
      elements: [],
      background: '#ffffff',
    },
    {
      id: 'brainstorm',
      title: 'Brainstorm',
      description: 'Sticky notes layout for brainstorming ideas',
      thumbnail: '',
      background: '#fefce8',
      elements: [
        { id: 't1', type: 'sticky', x: 100, y: 100, width: 200, height: 150, text: 'Idea 1', color: '#fef08a', fill: '#fef08a', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 't2', type: 'sticky', x: 350, y: 100, width: 200, height: 150, text: 'Idea 2', color: '#bfdbfe', fill: '#bfdbfe', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 't3', type: 'sticky', x: 600, y: 100, width: 200, height: 150, text: 'Idea 3', color: '#bbf7d0', fill: '#bbf7d0', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 't4', type: 'sticky', x: 100, y: 300, width: 200, height: 150, text: 'Idea 4', color: '#fecaca', fill: '#fecaca', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 't5', type: 'sticky', x: 350, y: 300, width: 200, height: 150, text: 'Idea 5', color: '#e9d5ff', fill: '#e9d5ff', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 't6', type: 'sticky', x: 600, y: 300, width: 200, height: 150, text: 'Idea 6', color: '#fed7aa', fill: '#fed7aa', strokeWidth: 0, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
      ],
    },
    {
      id: 'retrospective',
      title: 'Retrospective',
      description: 'What went well, what to improve, action items',
      thumbnail: '',
      background: '#f8fafc',
      elements: [
        { id: 'r1', type: 'text', x: 80, y: 30, width: 220, height: 40, text: '✅ Went Well', color: '#16a34a', fill: 'transparent', strokeWidth: 0, fontSize: 24, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: true, points: [], imageUrl: '' },
        { id: 'r2', type: 'text', x: 380, y: 30, width: 220, height: 40, text: '⚠️ Improve', color: '#ea580c', fill: 'transparent', strokeWidth: 0, fontSize: 24, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: true, points: [], imageUrl: '' },
        { id: 'r3', type: 'text', x: 680, y: 30, width: 220, height: 40, text: '🎯 Actions', color: '#2563eb', fill: 'transparent', strokeWidth: 0, fontSize: 24, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: true, points: [], imageUrl: '' },
        { id: 'r4', type: 'line', x: 300, y: 20, width: 0, height: 500, points: [{ x: 0, y: 0 }, { x: 0, y: 500 }], text: '', color: '#d1d5db', fill: 'transparent', strokeWidth: 2, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: true, imageUrl: '' },
        { id: 'r5', type: 'line', x: 600, y: 20, width: 0, height: 500, points: [{ x: 0, y: 0 }, { x: 0, y: 500 }], text: '', color: '#d1d5db', fill: 'transparent', strokeWidth: 2, fontSize: 16, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: true, imageUrl: '' },
      ],
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      description: 'Central idea with branching topics',
      thumbnail: '',
      background: '#f0fdf4',
      elements: [
        { id: 'm1', type: 'ellipse', x: 350, y: 250, width: 200, height: 80, text: 'Main Topic', color: '#6366f1', fill: '#eef2ff', strokeWidth: 2, fontSize: 18, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 1, locked: false, points: [], imageUrl: '' },
        { id: 'm2', type: 'ellipse', x: 100, y: 100, width: 150, height: 60, text: 'Sub-topic 1', color: '#8b5cf6', fill: '#f5f3ff', strokeWidth: 2, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 1, locked: false, points: [], imageUrl: '' },
        { id: 'm3', type: 'ellipse', x: 600, y: 100, width: 150, height: 60, text: 'Sub-topic 2', color: '#ec4899', fill: '#fdf2f8', strokeWidth: 2, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 1, locked: false, points: [], imageUrl: '' },
        { id: 'm4', type: 'ellipse', x: 100, y: 400, width: 150, height: 60, text: 'Sub-topic 3', color: '#14b8a6', fill: '#f0fdfa', strokeWidth: 2, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 1, locked: false, points: [], imageUrl: '' },
        { id: 'm5', type: 'ellipse', x: 600, y: 400, width: 150, height: 60, text: 'Sub-topic 4', color: '#f59e0b', fill: '#fffbeb', strokeWidth: 2, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 1, locked: false, points: [], imageUrl: '' },
      ],
    },
    {
      id: 'wireframe',
      title: 'Wireframe',
      description: 'UI wireframing with placeholder boxes',
      thumbnail: '',
      background: '#f1f5f9',
      elements: [
        { id: 'w1', type: 'rectangle', x: 50, y: 20, width: 800, height: 60, text: 'Header / Nav', color: '#94a3b8', fill: '#e2e8f0', strokeWidth: 1, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 'w2', type: 'rectangle', x: 50, y: 100, width: 500, height: 300, text: 'Main Content', color: '#94a3b8', fill: '#f8fafc', strokeWidth: 1, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 'w3', type: 'rectangle', x: 570, y: 100, width: 280, height: 300, text: 'Sidebar', color: '#94a3b8', fill: '#f8fafc', strokeWidth: 1, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
        { id: 'w4', type: 'rectangle', x: 50, y: 420, width: 800, height: 50, text: 'Footer', color: '#94a3b8', fill: '#e2e8f0', strokeWidth: 1, fontSize: 14, fontFamily: 'sans-serif', opacity: 1, rotation: 0, layer: 0, locked: false, points: [], imageUrl: '' },
      ],
    },
  ]

  res.json({ templates })
}

module.exports = {
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
}
