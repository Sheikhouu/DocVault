#!/usr/bin/env python3
import http.server
import socketserver
from datetime import datetime

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html = f"""
        <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>🐍 SERVEUR PYTHON FONCTIONNE !</h1>
            <p><strong>Port:</strong> 3000</p>
            <p><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>URL:</strong> {self.path}</p>
            <div style="background: #10b981; color: white; padding: 20px; margin: 20px; border-radius: 10px;">
                ✅ Si vous voyez cette page, le problème vient de Node.js !
            </div>
            <p>Testez maintenant avec Node.js pour comparer.</p>
        </body>
        </html>
        """
        self.wfile.write(html.encode())

if __name__ == "__main__":
    PORT = 3000
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print(f"🚀 Serveur Python démarré sur http://localhost:{PORT}")
        print("🔍 Ctrl+C pour arrêter")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\\n🛑 Serveur arrêté")