import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { auditService } from '../api/auditService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import AuditTable from '../components/data/AuditTable.jsx';
import { EVENT_TYPES } from '../constants/security.js';

export default function AuditPage() {
  const { token } = useAuth();
  const [type, setType] = useState('');
  const { data, error, loading, reload } = useApiResource(() => auditService.list(token, { type }), [token, type]);

  return (
    <>
      <PageHeader
        title="Auditoría de seguridad"
        description="Registro de inicios de sesión, tokens rechazados, accesos denegados y entradas bloqueadas. Solo administración."
        action={<Button variant="secondary" onClick={reload} loading={loading} loadingText="Actualizando…">Actualizar</Button>}
      />

      <Card>
        <div className="filters">
          <label htmlFor="type" className="field__label">Tipo de evento</label>
          <select id="type" className="field__input filters__select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(EVENT_TYPES).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>

        <Alert kind={error?.kind}>{error?.message}</Alert>
        {loading && !data && <Spinner />}
        {data && (data.total > 0
          ? <AuditTable events={data.events} />
          : <p className="empty">Aún no hay eventos de este tipo. Intenta iniciar sesión con una contraseña incorrecta para generar uno.</p>)}
      </Card>
    </>
  );
}
