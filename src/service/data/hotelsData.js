// services/data/hotelsData.js
const hotels = [
  {
    id: "hotel1",
    name: "Hotel Sunshine",
    rooms: [
      { roomId: "room1", type: "Single", total: 15, available: 15 },
      { roomId: "room2", type: "Double", total: 8, available: 8 },
      { roomId: "room3", type: "Suite", total: 3, available: 3 }
    ]
  },
  {
    id: "hotel2",
    name: "Grand Plaza",
    rooms: [
      { roomId: "room4", type: "Single", total: 12, available: 12 },
      { roomId: "room5", type: "Double", total: 6, available: 6 }
    ]
  },
  {
    id: "hotel3",
    name: "The Royal Orchid",
    rooms: [
      { roomId: "room6", type: "Single", total: 10, available: 10 },
      { roomId: "room7", type: "Double", total: 7, available: 7 },
      { roomId: "room8", type: "Suite", total: 4, available: 4 }
    ]
  },
  {
    id: "hotel4",
    name: "Sunset Bay Resort",
    rooms: [
      { roomId: "room9", type: "Single", total: 20, available: 20 },
      { roomId: "room10", type: "Double", total: 10, available: 10 },
      { roomId: "room11", type: "Suite", total: 5, available: 5 }
    ]
  },
  {
    id: "hotel5",
    name: "Urban Retreat",
    rooms: [
      { roomId: "room12", type: "Single", total: 18, available: 18 },
      { roomId: "room13", type: "Double", total: 9, available: 9 }
    ]
  },
  {
    id: "hotel6",
    name: "Emerald Inn",
    rooms: [
      { roomId: "room14", type: "Single", total: 14, available: 14 },
      { roomId: "room15", type: "Double", total: 8, available: 8 },
      { roomId: "room16", type: "Suite", total: 3, available: 3 }
    ]
  },
  {
    id: "hotel7",
    name: "Lakeside Lodge",
    rooms: [
      { roomId: "room17", type: "Single", total: 16, available: 16 },
      { roomId: "room18", type: "Double", total: 7, available: 7 },
      { roomId: "room19", type: "Suite", total: 2, available: 2 }
    ]
  },
  {
    id: "hotel8",
    name: "Mountain View Resort",
    rooms: [
      { roomId: "room20", type: "Single", total: 20, available: 20 },
      { roomId: "room21", type: "Double", total: 10, available: 10 },
      { roomId: "room22", type: "Suite", total: 4, available: 4 }
    ]
  },
  {
    id: "hotel9",
    name: "City Central Hotel",
    rooms: [
      { roomId: "room23", type: "Single", total: 22, available: 22 },
      { roomId: "room24", type: "Double", total: 12, available: 12 }
    ]
  },
  {
    id: "hotel10",
    name: "Ocean Breeze",
    rooms: [
      { roomId: "room25", type: "Single", total: 18, available: 18 },
      { roomId: "room26", type: "Double", total: 8, available: 8 },
      { roomId: "room27", type: "Suite", total: 3, available: 3 }
    ]
  },
  {
    id: "hotel11",
    name: "Royal Heritage",
    rooms: [
      { roomId: "room28", type: "Single", total: 15, available: 15 },
      { roomId: "room29", type: "Double", total: 10, available: 10 },
      { roomId: "room30", type: "Suite", total: 5, available: 5 }
    ]
  },
  {
    id: "hotel12",
    name: "Majestic Palace",
    rooms: [
      { roomId: "room31", type: "Single", total: 25, available: 25 },
      { roomId: "room32", type: "Double", total: 15, available: 15 },
      { roomId: "room33", type: "Suite", total: 5, available: 5 }
    ]
  },
  {
    id: "hotel13",
    name: "Serenity Suites",
    rooms: [
      { roomId: "room34", type: "Single", total: 12, available: 12 },
      { roomId: "room35", type: "Double", total: 8, available: 8 },
      { roomId: "room36", type: "Suite", total: 4, available: 4 }
    ]
  },
  {
    id: "hotel14",
    name: "Crystal Towers",
    rooms: [
      { roomId: "room37", type: "Single", total: 20, available: 20 },
      { roomId: "room38", type: "Double", total: 10, available: 10 }
    ]
  },
  {
    id: "hotel15",
    name: "Harbor View",
    rooms: [
      { roomId: "room39", type: "Single", total: 18, available: 18 },
      { roomId: "room40", type: "Double", total: 9, available: 9 },
      { roomId: "room41", type: "Suite", total: 3, available: 3 }
    ]
  },
  {
    id: "hotel16",
    name: "Paradise Inn",
    rooms: [
      { roomId: "room42", type: "Single", total: 14, available: 14 },
      { roomId: "room43", type: "Double", total: 7, available: 7 }
    ]
  },
  {
    id: "hotel17",
    name: "Skyline Hotel",
    rooms: [
      { roomId: "room44", type: "Single", total: 20, available: 20 },
      { roomId: "room45", type: "Double", total: 10, available: 10 },
      { roomId: "room46", type: "Suite", total: 4, available: 4 }
    ]
  },
  {
    id: "hotel18",
    name: "Coastal Comfort",
    rooms: [
      { roomId: "room47", type: "Single", total: 16, available: 16 },
      { roomId: "room48", type: "Double", total: 8, available: 8 }
    ]
  },
  {
    id: "hotel19",
    name: "Eagle's Nest",
    rooms: [
      { roomId: "room49", type: "Single", total: 12, available: 12 },
      { roomId: "room50", type: "Double", total: 6, available: 6 },
      { roomId: "room51", type: "Suite", total: 2, available: 2 }
    ]
  },
  {
    id: "hotel20",
    name: "Vintage Court",
    rooms: [
      { roomId: "room52", type: "Single", total: 15, available: 15 },
      { roomId: "room53", type: "Double", total: 7, available: 7 },
      { roomId: "room54", type: "Suite", total: 3, available: 3 }
    ]
  }
];

module.exports = hotels;
