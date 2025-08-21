import type { Metadata } from 'next';

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