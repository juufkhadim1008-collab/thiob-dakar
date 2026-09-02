const fs = require('fs');
const path = require('path');

const files = [
  'components/MobileDeviceShowcase.tsx',
  'components/RestaurantSpace.tsx',
  'components/CourierSpace.tsx',
  'components/AdminSpace.tsx',
  'components/CartDrawer.tsx',
  'components/ClientSpace.tsx',
  'components/OrderTrackingModal.tsx',
  'components/Navbar.tsx',
  'components/Footer.tsx'
];

const replacements = [
  [/ÃƒÂ©/g, 'é'],
  [/ÃƒÂ¨/g, 'è'],
  [/ÃƒÂ /g, 'à'],
  [/ÃƒÂ¢/g, 'â'],
  [/ÃƒÂ®/g, 'î'],
  [/ÃƒÂ´/g, 'ô'],
  [/ÃƒÂ¹/g, 'ù'],
  [/ÃƒÂ§/g, 'ç'],
  [/Ãƒâ€°/g, 'É'],
  [/Ã©/g, 'é'],
  [/Ã¨/g, 'è'],
  [/Ã /g, 'à'],
  [/Ã¢/g, 'â'],
  [/Ã®/g, 'î'],
  [/Ã´/g, 'ô'],
  [/Ã¹/g, 'ù'],
  [/Ã§/g, 'ç'],
  [/Ã‰/g, 'É'],
  [/Ã¢Å¾â€ /g, '→'],
  [/Ã¢Å“â€¢/g, '✕'],
  [/Ã¢â‚¬â„¢/g, "'"],
  [/Ã¢â‚¬â€œ/g, '—'],
  [/Ã°Å¸â€ºÂµ/g, '🛵'],
  [/Ã°Å¸â€œÂ /g, '📍'],
  [/Ã°Å¸â€œÂ±/g, '📱'],
  [/Ã°Å¸Å’Å /g, '🌊'],
  [/Ã°Å¸â€œ¦/g, '📦'],
  [/Ã°Å¸â€œÅ¾/g, '📞'],
  [/Ã°Å¸â€¡¸Ã°Å¸â€¡³/g, '🇸🇳'],
  [/Ã°Å¸â€ºÂ/g, '🛵'],
  [/Ã°Å¸â€œ/g, '📍'],
  [/â€¢/g, '•'],
  [/âž”/g, '→'],
  [/âœ“/g, '✓'],
  [/â ¤ï¸ /g, '❤️'],
  [/ðŸ¤ /g, '🤍'],
  [/Ã°Å¸Å¸Â¢/g, '🟢']
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');
  for (const [pattern, repl] of replacements) {
    c = c.replace(pattern, repl);
  }
  fs.writeFileSync(file, c, 'utf8');
  console.log('Cleaned', file);
}
