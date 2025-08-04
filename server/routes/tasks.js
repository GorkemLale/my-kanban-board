const express = require('express');
const taskValidation = require('../middleware/validationTask');
const taskController = require('../controllers/taskController');
const spamBlocker = require('../middleware/spamBlockerTask');

const router = express.Router();

router.get('/:boardId', taskController.getAllTasks);
router.post('/:boardId', spamBlocker.rateLimiter, spamBlocker.sameInputBlocker, taskValidation, taskController.createTask);
router.put('/', taskValidation, taskController.updateTask);
router.delete('/', taskController.deleteTask);

module.exports = router;