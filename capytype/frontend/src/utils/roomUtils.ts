const CAPITAL_CITIES = [
  // Brazil capitals
  'Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
  // International
  'Tokyo', 'Delhi', 'Beijing', 'Moscow', 'Istanbul', 'Cairo', 'London', 'Paris',
  'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Athens', 'Stockholm',
  'Oslo', 'Copenhagen', 'Helsinki', 'Dublin', 'Lisbon', 'Warsaw', 'Prague',
  'Budapest', 'Bucharest', 'Sofia', 'Belgrade', 'Zagreb', 'Bratislava', 'Ljubljana',
  'Riga', 'Tallinn', 'Vilnius', 'Kiev', 'Minsk', 'Baku', 'Tbilisi', 'Yerevan',
  'Ankara', 'Beirut', 'Damascus', 'Amman', 'Jerusalem', 'Riyadh', 'Doha', 'Manama',
  'Kuwait', 'Muscat', 'Abu Dhabi', 'Dubai', 'Islamabad', 'Dhaka', 'Kathmandu'
];

export const generateRoomName = (roomId: string) => {
  const hash = roomId.split('-')[0];
  const cityIndex = parseInt(hash, 16) % CAPITAL_CITIES.length;
  const city = CAPITAL_CITIES[cityIndex];
  // Always use the format: "{city} Capy Room"
  return {
    readableId: `${city} Capy Room`,
    fullId: roomId
  };
};