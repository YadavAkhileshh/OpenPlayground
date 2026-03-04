const express = require('express');
const router = express.Router();
const snippetController = require('../controllers/snippetController');
const validate = require('../middleware/validate');
const { createSnippet, updateSnippet } = require('../validations/snippet.validation');

router.get('/', snippetController.getSnippets);
router.post('/', validate(createSnippet), snippetController.createSnippet);

router.patch('/:id/favorite', snippetController.toggleFavorite);
router.put('/:id', validate(updateSnippet), snippetController.updateSnippet);
router.delete('/:id', snippetController.deleteSnippet);

module.exports = router;
