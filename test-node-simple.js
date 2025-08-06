// Test Node.js ultra-simple
console.log('✅ Node.js fonctionne !');
console.log('Version:', process.version);
console.log('Platform:', process.platform);

// Test création de serveur HTTP simple
const http = require('http');

console.log('🔍 Tentative création serveur HTTP...');

try {
  const server = http.createServer((req, res) => {
    console.log('📥 Requête reçue:', req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Node.js server works!\n');
  });

  server.on('error', (err) => {
    console.error('❌ Erreur serveur:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  });

  server.listen(3001, '127.0.0.1', () => {
    console.log('🚀 Serveur Node.js démarré sur http://127.0.0.1:3001');
    console.log('🔍 Testez avec: curl http://127.0.0.1:3001');
  });

} catch (error) {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
}