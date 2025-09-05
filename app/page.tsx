'use client';

import dynamic from 'next/dynamic';
import '@/index.css';
import '@/index.dev.css';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function HomePage() {
  return <App />;
}
