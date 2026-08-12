import { lazy, Suspense } from 'react';

const OrthoGlossaire = lazy(() => import('@/components/glossaire-orthoptie'));

function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#EEF3F1',
        color: '#5C7A73',
      }}
    >
      Chargement du glossaire…
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <OrthoGlossaire />
    </Suspense>
  );
}

export default App;
