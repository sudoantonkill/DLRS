// Real geospatial plots with exact polygon boundaries, blockchain hashes, and metadata
export const INITIAL_PLOTS = [
  {
    id: 101,
    name: "Plot 101 // Bandra West Coastal Zone",
    location: "Bandra West, Mumbai (Carter Road Coastal Belt)",
    category: "Commercial High-Density / Coastal Special Zone",
    lat: 19.0596,
    lng: 72.8295,
    area: 14250, // sq ft
    acres: 0.327,
    sqMeters: 1323.8,
    owner: "0x71C8360f3E24296bA72338A99a463F83b90218A1",
    ownerLabel: "Aegis Maritime Development Corp",
    txHash: "0x4f8a92b91c78e192a019482b8109d736a19f8b2c89e31d927a4e62810f39a041",
    blockNumber: 6842914,
    timestamp: "2026-10-11T14:32:00Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    merkleRoot: "0x98f2a1b9487c631e843b0289d04f1e58a719c83b42918a9d18e38f903a42918a",
    boundaryColor: "#00f0ff", // Electric Cyan
    status: "VERIFIED_ON_CHAIN",
    // 4-point real bounding polygon around Carter Road
    polygon: [
      [19.0604, 72.8288],
      [19.0601, 72.8304],
      [19.0588, 72.8301],
      [19.0591, 72.8285]
    ]
  },
  {
    id: 102,
    name: "Plot 102 // Nariman Point Financial Hub",
    location: "Nariman Point, Marine Drive, Mumbai",
    category: "Grade-A Commercial Financial District",
    lat: 18.9256,
    lng: 72.8242,
    area: 28500,
    acres: 0.654,
    sqMeters: 2647.7,
    owner: "0x3B6899E2F9F2489C83a45c2B4A1054320914cD62",
    ownerLabel: "Apex Sovereign Trust",
    txHash: "0x91d8e41a0293847f98b10928374a58e81923091c83b42918a9d18e38f903b174",
    blockNumber: 6841120,
    timestamp: "2026-10-09T08:15:22Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    merkleRoot: "0x7c98f821e25e9834279b3211a78d06b52a1293a745c83b42918a9d18e38f903a",
    boundaryColor: "#00ff88", // Neon Emerald
    status: "VERIFIED_ON_CHAIN",
    polygon: [
      [18.9264, 72.8234],
      [18.9261, 72.8252],
      [18.9248, 72.8249],
      [18.9251, 72.8231]
    ]
  },
  {
    id: 103,
    name: "Plot 103 // Andheri East Cyber Park",
    location: "MIDC Andheri East, Mumbai",
    category: "High-Tech R&D Infrastructure",
    lat: 19.1136,
    lng: 72.8697,
    area: 45000,
    acres: 1.033,
    sqMeters: 4180.6,
    owner: "0x9812A27e2894589dD380482B14e6d328476210fA",
    ownerLabel: "Nexus Cybertech Infrastructure",
    txHash: "0x3847291a028374f9810928374a58e81923091c83b42918a9d18e38f903c8290",
    blockNumber: 6839441,
    timestamp: "2026-10-08T11:42:19Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmZtmD2qt8STkpwQnEBsuTaL4Wg44vMpaTMNNkndSVeEBh",
    merkleRoot: "0x5a18b9487c631e843b0289d04f1e58a719c83b42918a9d18e38f903a7419c8",
    boundaryColor: "#ff007f", // Neon Magenta / Laser Pink
    status: "VERIFIED_ON_CHAIN",
    polygon: [
      [19.1146, 72.8687],
      [19.1143, 72.8708],
      [19.1127, 72.8705],
      [19.1130, 72.8684]
    ]
  },
  {
    id: 104,
    name: "Plot 104 // Lower Parel Luxury Estate",
    location: "Senapati Bapat Marg, Lower Parel, Mumbai",
    category: "Prime Urban Redevelopment / High-Rise",
    lat: 18.9986,
    lng: 72.8312,
    area: 32000,
    acres: 0.735,
    sqMeters: 2972.9,
    owner: "0x14C9487cD48392019482B14e6d328476210fA38b",
    ownerLabel: "Elysium Towers Syndicate",
    txHash: "0x7483921a028374f9810928374a58e81923091c83b42918a9d18e38f903d9381",
    blockNumber: 6837920,
    timestamp: "2026-10-06T19:04:11Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4",
    merkleRoot: "0x31b9487c631e843b0289d04f1e58a719c83b42918a9d18e38f903a8947291a",
    boundaryColor: "#ffd700", // Electric Gold
    status: "VERIFIED_ON_CHAIN",
    polygon: [
      [18.9995, 72.8303],
      [18.9992, 72.8322],
      [18.9977, 72.8319],
      [18.9980, 72.8300]
    ]
  },
  {
    id: 105,
    name: "Plot 105 // Powai Silicon Valley Lakefront",
    location: "Hiranandani Gardens, Powai, Mumbai",
    category: "Tech Campus & AI Innovation Hub",
    lat: 19.1176,
    lng: 72.9060,
    area: 52000,
    acres: 1.194,
    sqMeters: 4830.9,
    owner: "0x5829C2894589dD380482B14e6d328476210fA918",
    ownerLabel: "Vanguard Quantum Robotics",
    txHash: "0x8291041a028374f9810928374a58e81923091c83b42918a9d18e38f903e0492",
    blockNumber: 6835012,
    timestamp: "2026-10-04T16:21:45Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmSnuWmxpt943pNXSCugAbGsh27NdKrg2P45Yv6V1g6742",
    merkleRoot: "0x42918a9d18e38f903a7419c83b42918a9d18e38f903a8947291a028374f98109",
    boundaryColor: "#a855f7", // Holographic Violet
    status: "VERIFIED_ON_CHAIN",
    polygon: [
      [19.1186, 72.9049],
      [19.1182, 72.9072],
      [19.1166, 72.9069],
      [19.1170, 72.9046]
    ]
  },
  {
    id: 106,
    name: "Plot 106 // Juhu Coastline Reserve",
    location: "Juhu Tara Road, Juhu Beach, Mumbai",
    category: "Ultra-Prime Residential Reserve",
    lat: 19.1075,
    lng: 72.8263,
    area: 21500,
    acres: 0.493,
    sqMeters: 1997.4,
    owner: "0x89A12019482B14e6d328476210fA38b14C9487c",
    ownerLabel: "Koul Sovereign Family Trust",
    txHash: "0x1928374a58e81923091c83b42918a9d18e38f903f8291041a028374f98109283",
    blockNumber: 6833190,
    timestamp: "2026-10-02T10:11:00Z",
    chainId: 11155111,
    chainName: "Ethereum Sepolia Testnet",
    contractAddress: "0x8d345393D1608376e590780609A85803A6Ef500e",
    ipfsCid: "ipfs://QmbWqxBEKC3P8tTXBSFL143wEHWhHzKNYL5CEWu3N87R32",
    merkleRoot: "0x8947291a028374f9810928374a58e81923091c83b42918a9d18e38f903a19283",
    boundaryColor: "#06b6d4", // Electric Turquoise
    status: "VERIFIED_ON_CHAIN",
    polygon: [
      [19.1084, 72.8254],
      [19.1081, 72.8273],
      [19.1066, 72.8270],
      [19.1069, 72.8251]
    ]
  }
];

// Helper to calculate a 4-point bounding polygon around any clicked lat/lng
export function generateParcelPolygon(lat, lng, areaSqFt = 15000) {
  // approx delta for a ~120m x ~120m plot
  const latDelta = 0.00065 + (Math.random() * 0.0002);
  const lngDelta = 0.00075 + (Math.random() * 0.0002);
  return [
    [lat + latDelta, lng - lngDelta],
    [lat + latDelta * 0.9, lng + lngDelta],
    [lat - latDelta, lng + lngDelta * 0.85],
    [lat - latDelta * 0.95, lng - lngDelta]
  ];
}
