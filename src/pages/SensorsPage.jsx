import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { useIdsLive } from '../hooks/useIdsLive.js';
import { idsService } from '../api/idsService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CommandBlock from '../components/ui/CommandBlock.jsx';
import SensorBadge from '../components/ids/SensorBadge.jsx';
import ArchitectureMap from '../components/ids/ArchitectureMap.jsx';
import RuleAnatomy from '../components/ids/RuleAnatomy.jsx';
import DefenseLayers from '../components/security/DefenseLayers.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatDateTime, formatNumber } from '../utils/format.js';

const OBJECTIVE_SHORT = { icmp: 'Obj. 1 · ICMP', sniffer: 'Obj. 2 · Sniffer', nmap: 'Obj. 3 · Nmap', web: 'Extra · Web' };

function SensorConfig({ sensor }) {
  return (
    <section className={`config-card config-card--${sensor.id}`}>
      <header className="config-card__head">
        <SensorBadge sensor={sensor.id} />
        <h2 className="config-card__title">{sensor.host}</h2>
        <p className="config-card__role">{sensor.role}</p>
      </header>
      <dl className="facts">
        <div><dt>Tipo</dt><dd>{sensor.kind}</dd></div>
        <div><dt>IP privada</dt><dd className="mono">{sensor.ip}</dd></div>
        <div><dt>Interfaz monitorizada</dt><dd className="mono">{sensor.interface}</dd></div>
        <div><dt>HOME_NET</dt><dd className="mono">{sensor.homeNet}</dd></div>
        <div><dt>EXTERNAL_NET</dt><dd className="mono">{sensor.externalNet}</dd></div>
        <div><dt>Configuración</dt><dd className="mono">{sensor.configFile}</dd></div>
        <div><dt>Carpeta de reglas</dt><dd className="mono">{sensor.ruleDir}</dd></div>
        <div><dt>Archivos de reglas</dt><dd className="mono">{sensor.ruleFiles.join(', ')}</dd></div>
        <div><dt>Registros</dt><dd className="mono">{sensor.logFiles.join(', ')}</dd></div>
      </dl>
      <p className="config-card__label">Validar la configuración</p>
      <CommandBlock command={sensor.testCommand} />
      <p className="config-card__label">Estado del servicio</p>
      <CommandBlock command={sensor.serviceCommand} />
    </section>
  );
}

export default function SensorsPage() {
  const { token } = useAuth();
  const { alerts } = useIdsLive();
  const { data, error, loading } = useApiResource(() => idsService.setup(token), [token]);
  const [selectedKey, setSelectedKey] = useState('snort:1000001');

  const counts = useMemo(() => {
    const m = new Map();
    for (const a of alerts) m.set(`${a.sensor}:${a.sid}`, (m.get(`${a.sensor}:${a.sid}`) ?? 0) + 1);
    return m;
  }, [alerts]);

  const selected = data?.rules.find((r) => `${r.sensor}:${r.sid}` === selectedKey) ?? data?.rules[0];

  return (
    <>
      <PageHeader
        title="Sensores y reglas"
        description="Dónde vive cada sensor, qué red protege (HOME_NET), qué interfaz escucha y qué reglas locales carga. Selecciona una regla para ver su anatomía."
      />
      <Alert kind={error?.kind}>{error?.message}</Alert>
      {loading && !data && <Spinner label="Cargando la configuración de los sensores…" />}

      {data && (
        <div className="sensors-page">
          <Card className="sensors-page__arch" title="Dónde mira cada sensor">
            <ArchitectureMap targets={data.targets} />
            <p className="note">
              Un IDS solo analiza el tráfico que llega a su interfaz. Suricata, en el frontend, ve lo que entra desde internet;
              Snort, en el backend, ve lo que cruza el peering. Por eso cada uno tiene su propio HOME_NET.
            </p>
          </Card>

          <div className="sensors-page__configs">
            {data.sensors.map((s) => <SensorConfig key={s.id} sensor={s} />)}
          </div>

          <Card className="sensors-page__storage" title="Almacenamiento de alertas y auditoría">
            <div className="storage">
              <div className="storage__engine">
                <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" /><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" /></svg>
                <div>
                  <p className="storage__name">{data.storage.engine}</p>
                  <Badge tone={data.storage.persistent ? 'ok' : 'warn'}>{data.storage.persistent ? 'Persistente: sobrevive a reinicios' : 'Temporal: se pierde al reiniciar la API'}</Badge>
                </div>
              </div>
              <dl className="facts storage__facts">
                <div><dt>Alertas guardadas (histórico)</dt><dd>{formatNumber(data.storage.alerts)}</dd></div>
                <div><dt>Eventos de auditoría</dt><dd>{formatNumber(data.storage.auditEvents)}</dd></div>
                <div><dt>Primera alerta registrada</dt><dd>{formatDateTime(data.storage.since)}</dd></div>
              </dl>
            </div>
            {!data.storage.persistent && <p className="note">Para guardar el histórico configura DATABASE_URL en el .env del backend (PostgreSQL).</p>}
          </Card>

          <Card className="sensors-page__anatomy" title="Anatomía de una regla">
            {selected && (
              <>
                <div className="anatomy__meta">
                  <SensorBadge sensor={selected.sensor} />
                  <span className="mono">{selected.file}</span>
                  <span>{OBJECTIVE_SHORT[selected.objective]}</span>
                </div>
                <pre className="rule-text">{selected.text}</pre>
                <RuleAnatomy rule={selected} />
                <div className="anatomy__why">
                  <div><h3>Qué tráfico la dispara</h3><p>{selected.trigger}</p></div>
                  <div><h3>Por qué es esperable</h3><p>{selected.reason}</p></div>
                </div>
              </>
            )}
          </Card>

          <Card className="sensors-page__rules" title={`Reglas locales cargadas (${data.rules.length})`}>
            <div className="table-wrap">
              <table className="table table--rules">
                <thead>
                  <tr>
                    <th scope="col">Sensor</th>
                    <th scope="col">SID</th>
                    <th scope="col">Mensaje (msg)</th>
                    <th scope="col">Prueba</th>
                    <th scope="col">Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rules.map((r) => {
                    const key = `${r.sensor}:${r.sid}`;
                    const msg = /msg:"([^"]+)"/.exec(r.text)?.[1] ?? '';
                    return (
                      <tr
                        key={key}
                        className={key === (selected && `${selected.sensor}:${selected.sid}`) ? 'is-selected' : ''}
                        onClick={() => setSelectedKey(key)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedKey(key); } }}
                        tabIndex={0}
                      >
                        <td><SensorBadge sensor={r.sensor} showKind={false} /></td>
                        <td className="mono">{r.sid}</td>
                        <td>{msg}</td>
                        <td className="nowrap">{OBJECTIVE_SHORT[r.objective]}</td>
                        <td className="num">{formatNumber(counts.get(key) ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="sensors-page__layers" title="Defensa en profundidad: dónde encaja el IDS">
            <DefenseLayers />
          </Card>
        </div>
      )}
    </>
  );
}
