// Utility for generating room names in backend
const CAPITAL_CITIES = [
  'Tokyo', 'Delhi', 'Beijing', 'Moscow', 'Istanbul', 'Cairo', 'London', 'Paris',
  'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Athens', 'Stockholm',
  'Oslo', 'Copenhagen', 'Helsinki', 'Dublin', 'Lisbon', 'Warsaw', 'Prague',
  'Budapest', 'Bucharest', 'Sofia', 'Belgrade', 'Zagreb', 'Bratislava', 'Ljubljana',
  'Riga', 'Tallinn', 'Vilnius', 'Kiev', 'Minsk', 'Baku', 'Tbilisi', 'Yerevan',
  'Ankara', 'Beirut', 'Damascus', 'Amman', 'Jerusalem', 'Riyadh', 'Doha', 'Manama',
  'Kuwait', 'Muscat', 'Abu Dhabi', 'Dubai', 'Islamabad', 'Dhaka', 'Kathmandu'
];

function generateRoomName(roomId) {
  const hash = roomId.split('-')[0];
  const cityIndex = parseInt(hash, 16) % CAPITAL_CITIES.length;
  const city = CAPITAL_CITIES[cityIndex];
  return `${city}-CapyRace`;
}

module.exports = { generateRoomName };
