import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIdsLive } from '../hooks/useIdsLive.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import AlertTable from '../components/ids/AlertTable.jsx';
import AlertDetail from '../components/ids/AlertDetail.jsx';
import LiveIndicator from '../components/ids/LiveIndicator.jsx';
import { SENSOR_META } from '../constants/ids.js';

const OBJECTIVE_FILTERS = [
  { id: '', label: 'Todas las pruebas' },
  { id: 'icmp', label: 'Objetivo 1 · ICMP' },
  { id: 'sniffer', label: 'Objetivo 2 · Sniffer' },
  { id: 'nmap', label: 'Objetivo 3 · Nmap' },
  { id: 'web', label: 'Extra · Web' },
];

export default function AlertsPage() {
  const { alerts, status, paused, setPaused, muted, setMuted } = useIdsLive();
  const location = useLocation();
  const [sensor, setSensor] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedId, setSelectedId] = useState(location.state?.select ?? null);

  useEffect(() => {
    if (location.state?.select) setSelectedId(location.state.select);
  }, [location.state]);

  const filtered = useMemo(
    () => alerts.filter((a) => (!sensor || a.sensor === sensor) && (!objective || a.objective === objective)),
    [alerts, sensor, objective],
  );
  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Alertas en vivo"
        description="Cada fila es una alerta real de Snort o Suricata. Al seleccionarla verás el análisis: qué tráfico la provocó, qué regla la generó y por qué era esperable."
        action={(
          <div className="page-header__actions">
            <LiveIndicator />
            <Button variant="secondary" onClick={() => setMuted(!muted)}>{muted ? 'Activar avisos' : 'Silenciar avisos'}</Button>
            <Button variant="secondary" onClick={() => setPaused(!paused)}>{paused ? 'Reanudar' : 'Pausar'}</Button>
          </div>
        )}
      />
      <Alert kind={status.error?.kind}>{status.error?.message}</Alert>

      <div className="alerts-layout">
        <Card>
          <div className="filters filters--wrap">
            <div className="segmented" role="group" aria-label="Filtrar por sensor">
              {[['', 'Todos'], ...Object.entries(SENSOR_META).map(([id, m]) => [id, `${m.label} · ${m.kind}`])].map(([id, label]) => (
                <button key={id || 'all'} type="button" className={`segmented__btn ${sensor === id ? 'is-on' : ''}`} onClick={() => setSensor(id)} aria-pressed={sensor === id}>{label}</button>
              ))}
            </div>
            <label htmlFor="objective" className="sr-only">Prueba</label>
            <select id="objective" className="field__input filters__select" value={objective} onChange={(e) => setObjective(e.target.value)}>
              {OBJECTIVE_FILTERS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <span className="filters__count">{filtered.length} alertas</span>
          </div>

          {filtered.length
            ? <AlertTable alerts={filtered} selectedId={selectedId} onSelect={(a) => setSelectedId(a.id)} />
            : <p className="empty">No hay alertas con estos filtros. Genera tráfico desde la página Demo en vivo.</p>}
        </Card>
        <AlertDetail alert={selected} onClose={selected ? () => setSelectedId(null) : null} />
      </div>
    </>
  );
}
