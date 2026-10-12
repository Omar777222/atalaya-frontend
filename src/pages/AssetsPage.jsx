import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { assetsService } from '../api/assetsService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import AssetTable from '../components/data/AssetTable.jsx';

const SUGGESTIONS = ['backend', 'Perímetro', 'UFW', '10.0.128'];

export default function AssetsPage() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const { data, error, loading } = useApiResource(() => assetsService.search(token, query), [token, query]);

  const search = (value) => { setInput(value); setQuery(value); };

  return (
    <>
      <PageHeader
        title="Inventario de la arquitectura"
        description="Componentes desplegados en AWS con su zona, su exposición y los controles que los protegen."
      />

      <Card>
        <form className="search" onSubmit={(e) => { e.preventDefault(); setQuery(input); }} role="search">
          <label htmlFor="q" className="sr-only">Buscar componente</label>
          <input id="q" className="field__input search__input" value={input} maxLength={60}
            placeholder="Busca por nombre, zona, IP o control" onChange={(e) => setInput(e.target.value)} />
          <Button type="submit" loading={loading} loadingText="Buscando…">Buscar</Button>
        </form>
        <div className="search__suggestions">
          <span>Prueba con:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => search(s)}>{s}</button>
          ))}
        </div>
        <p className="search__hint">
          La búsqueda solo acepta letras, números, espacios y . _ - /. Cualquier otro carácter se rechaza en el servidor
          y, en AWS, el WAF bloquea antes los intentos de SQL Injection o XSS.
        </p>

        <Alert kind={error?.kind}>{error?.message}</Alert>
        {loading && !data && <Spinner />}
        {data && !error && (
          <>
            <p className="results-count">{data.total} {data.total === 1 ? 'componente' : 'componentes'}{query && ` para «${query}»`}</p>
            {data.total > 0
              ? <AssetTable items={data.items} />
              : <p className="empty">No hay componentes que coincidan. Prueba con otra palabra.</p>}
          </>
        )}
      </Card>
    </>
  );
}
