const express = require('express');
const router = express.Router();
const {
  addWishlistItem,
  getMyWishlist,
  removeWishlistItem,
  getUnreadCount,
  markWishlistRead,
  getPendingCount,
} = require('../controllers/wishlistController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/', authMiddleware, addWishlistItem);
router.get('/mine', authMiddleware, getMyWishlist);
router.delete('/:id', authMiddleware, removeWishlistItem);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/pending-count', authMiddleware, getPendingCount);
router.put('/mark-read', authMiddleware, markWishlistRead);

module.exports = router;
