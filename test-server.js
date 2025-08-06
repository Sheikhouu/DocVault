const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Requête reçue:', req.url);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <html>
      <body>
        <h1>🎉 SERVEUR NODE.JS FONCTIONNE !</h1>
        <p>Port: 3000 | Timestamp: ${new Date().toLocaleString()}</p>
        <p>URL: ${req.url}</p>
        <p>Le problème venait de Next.js, pas de Node.js</p>
      </body>
    </html>
  `);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Serveur Node.js démarré sur http://localhost:3000');
  console.log('🔍 Si cette page fonctionne, le problème vient de Next.js');
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});