// services/routes/hotelsRoutes.js
const express = require('express');
const router = express.Router();
const hotels = require('../data/hotelsData');

// Endpoint to return all hotels
router.get('/hotels', (req, res) => {
  res.json(hotels);
});

// Endpoint to check room availability for a specific hotel and room type
router.get('/hotels/:hotelId/availability', (req, res) => {
  const { hotelId } = req.params;
  const { roomType } = req.query; // e.g., ?roomType=Single
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found.' });
  }
  const room = hotel.rooms.find(r => r.type.toLowerCase() === roomType.toLowerCase());
  if (!room) {
    return res.status(404).json({ error: 'Room type not found.' });
  }
  res.json({ available: room.available, total: room.total });
});

module.exports = router;
