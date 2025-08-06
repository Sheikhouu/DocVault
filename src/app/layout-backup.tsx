export const metadata = {
  title: 'DocVault - Test de Debug',
  description: 'Application de test pour résoudre le bug de chargement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DocVault Debug</title>
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0'
      }}>
        <div id="debug-info" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'green',
          color: 'white',
          padding: '5px 10px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          ✅ Layout chargé
        </div>
        {children}
      </body>
    </html>
  )
}