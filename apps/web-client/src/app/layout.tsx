import './global.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'BetStay',
  description: 'Hotel & Betting System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}