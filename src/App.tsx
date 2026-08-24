import { lazy, Suspense } from 'react';
import { supabaseConfigured } from '@/lib/supabase';

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

function ConfigError() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#EEF3F1',
        color: '#2F4A44',
      }}
    >
      <div style={{ maxWidth: '32rem', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Configuration Supabase manquante</h1>
        <p>
          Ajoutez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans les variables
          d&apos;environnement Vercel, puis redéployez le site.
        </p>
      </div>
    </div>
  );
}

function App() {
  if (!supabaseConfigured) {
    return <ConfigError />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <OrthoGlossaire />
    </Suspense>
  );
}

export default App;
