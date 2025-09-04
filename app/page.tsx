'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function HomePage() {
  return <App />;
}
