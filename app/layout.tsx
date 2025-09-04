import type { Metadata } from 'next';
import '@/index.css';
// Import development-only styles safely (ignored in prod builds)
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  import('@/index.dev.css');
}

export const metadata: Metadata = {
  title: 'Apt SqFt - Floor Plan Designer',
  description: 'Create and design floor plans with rooms and furniture',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}