import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'Sistema de Vacaciones - INABIE',
  description: 'Sistema de gestión de vacaciones del Instituto Nacional de Bienestar Estudiantil',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
