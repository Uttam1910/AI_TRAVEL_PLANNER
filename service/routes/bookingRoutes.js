// services/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const hotels = require('../data/hotelsData');

router.post('/bookings/hotel', (req, res) => {
  const { hotelId, roomType, customerName, checkIn, checkOut } = req.body;
  
  // Validate required fields
  if (!hotelId || !roomType || !customerName || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'All booking details are required.' });
  }
  
  // Find hotel and room
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found.' });
  }
  const room = hotel.rooms.find(r => r.type.toLowerCase() === roomType.toLowerCase());
  if (!room) {
    return res.status(404).json({ error: 'Room type not available.' });
  }
  
  // Check if the room is available
  if (room.available <= 0) {
    return res.status(400).json({ error: 'No rooms available of the selected type.' });
  }
  
  // Simulate booking by decrementing available count
  room.available -= 1;
  
  // Create a simulated booking record
  const bookingRecord = {
    bookingId: Date.now(), // simple unique id for demo purposes
    hotelId,
    roomType,
    customerName,
    checkIn,
    checkOut,
    bookedAt: new Date()
  };
  
  res.status(201).json({ message: 'Booking confirmed', booking: bookingRecord });
});

module.exports = router;
