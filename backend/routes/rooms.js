const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  getBlocks, 
  getBlock, 
  getRoomsByBlock, 
  getRoomInfo, 
  getComponentsByCategory 
} = require('../config/rooms');

const router = express.Router();

// @route   GET /api/rooms/blocks
// @desc    Get all college blocks
// @access  Private (All authenticated users)
router.get('/blocks', authenticateToken, (req, res) => {
  try {
    const blocks = getBlocks();
    
    res.json({
      status: 'success',
      data: {
        blocks
      }
    });
  } catch (error) {
    console.error('Get blocks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get blocks'
    });
  }
});

// @route   GET /api/rooms/blocks/:blockId
// @desc    Get specific block details with floors
// @access  Private (All authenticated users)
router.get('/blocks/:blockId', authenticateToken, (req, res) => {
  try {
    const { blockId } = req.params;
    const block = getBlock(blockId);
    
    if (!block) {
      return res.status(404).json({
        status: 'error',
        message: 'Block not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        block: {
          id: blockId,
          ...block
        }
      }
    });
  } catch (error) {
    console.error('Get block error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get block details'
    });
  }
});

// @route   GET /api/rooms/blocks/:blockId/rooms
// @desc    Get all rooms in a specific block
// @access  Private (All authenticated users)
router.get('/blocks/:blockId/rooms', authenticateToken, (req, res) => {
  try {
    const { blockId } = req.params;
    const rooms = getRoomsByBlock(blockId);
    
    res.json({
      status: 'success',
      data: {
        rooms
      }
    });
  } catch (error) {
    console.error('Get block rooms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get rooms for block'
    });
  }
});

// @route   GET /api/rooms/:roomCode
// @desc    Get specific room details by room code (e.g., B201, C301)
// @access  Private (All authenticated users)
router.get('/:roomCode', authenticateToken, (req, res) => {
  try {
    const { roomCode } = req.params;
    const roomInfo = getRoomInfo(roomCode);
    
    res.json({
      status: 'success',
      data: {
        room: {
          code: roomCode,
          ...roomInfo
        }
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get room details'
    });
  }
});

// @route   GET /api/rooms/:roomCode/components
// @desc    Get components for a specific room by room code
// @access  Private (All authenticated users)
router.get('/:roomCode/components', authenticateToken, (req, res) => {
  try {
    const { roomCode } = req.params;
    const roomInfo = getRoomInfo(roomCode);
    const componentsByCategory = getComponentsByCategory(roomCode);
    
    res.json({
      status: 'success',
      data: {
        components: roomInfo.components,
        componentsByCategory
      }
    });
  } catch (error) {
    console.error('Get room components error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get room components'
    });
  }
});

module.exports = router;