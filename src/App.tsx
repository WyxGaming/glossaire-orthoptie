import OrthoGlossaire from '@/components/glossaire-orthoptie';

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
        color: '#16302B',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Configuration manquante</h1>
        <p style={{ lineHeight: 1.5, marginBottom: '1rem' }}>
          Les variables Supabase ne sont pas configurées sur Vercel. Ajoutez{' '}
          <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code>, puis redéployez le site.
        </p>
        <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>
          Vercel → Settings → Environment Variables → Redeploy
        </p>
      </div>
    </div>
  );
}

function App() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return <ConfigError />;
  return <OrthoGlossaire />;
}

export default App;
