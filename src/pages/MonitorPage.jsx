import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { usePolling } from '../hooks/usePolling.js';
import { useIdsLive } from '../hooks/useIdsLive.js';
import { useNow } from '../hooks/useNow.js';
import { idsService } from '../api/idsService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import KpiTile from '../components/ids/KpiTile.jsx';
import SensorCard from '../components/ids/SensorCard.jsx';
import ObjectiveBoard from '../components/ids/ObjectiveBoard.jsx';
import AlertTimeline from '../components/ids/AlertTimeline.jsx';
import AlertFeed from '../components/ids/AlertFeed.jsx';
import LiveIndicator from '../components/ids/LiveIndicator.jsx';
import { ROLES } from '../constants/security.js';
import { formatNumber, timeAgo } from '../utils/format.js';

export default function MonitorPage() {
  const { token, user } = useAuth();
  const live = useIdsLive();
  const navigate = useNavigate();
  const now = useNow(2000);
  const [resetting, setResetting] = useState(false);
  const { data, error, loading, reload } = usePolling(() => idsService.overview(token), { intervalMs: 3000, deps: [token] });

  const detected = data?.objectives.filter((o) => o.detected).length ?? 0;

  const reset = async () => {
    setResetting(true);
    try {
      await idsService.reset(token);
      live.clearLocal();
      await reload();
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Centro de monitoreo"
        description="Suricata vigila la red del frontend y Snort el servidor backend. Todo lo que detectan llega aquí y al grupo de Telegram en segundos."
        action={(
          <div className="page-header__actions">
            <LiveIndicator />
            {user.role === ROLES.ADMIN && (
              <Button variant="secondary" onClick={reset} loading={resetting} loadingText="Reiniciando…">Reiniciar contadores</Button>
            )}
          </div>
        )}
      />

      <Alert kind={error?.kind}>{error?.message}</Alert>
      {!data && loading && <Spinner label="Consultando a los sensores…" />}

      {data && (
        <div className="monitor">
          <div className="monitor__kpis">
            <KpiTile label="Alertas totales" value={formatNumber(data.totals.all)} hint={`${formatNumber(data.totals.lastHour)} en la última hora`} tone="ink" />
            <KpiTile label="Suricata · frontend" value={formatNumber(data.totals.suricata)} hint="NIDS en ec2-frontend" tone="suricata" />
            <KpiTile label="Snort · backend" value={formatNumber(data.totals.snort)} hint="HIDS en ec2-backend" tone="snort" />
            <KpiTile label="Pruebas detectadas" value={`${detected} de ${data.objectives.length}`} hint={data.lastAlert ? `Última alerta ${timeAgo(data.lastAlert.timestamp, now)}` : 'Sin alertas todavía'} tone={detected === data.objectives.length ? 'ok' : 'beacon'} />
          </div>

          <Card className="monitor__objectives" title="Pruebas de la práctica" action={<Link to="/demo" className="link-btn">Abrir guion de la demo →</Link>}>
            <ObjectiveBoard objectives={data.objectives} />
          </Card>

          <div className="monitor__sensors">
            {data.sensors.map((s) => <SensorCard key={s.id} sensor={s} />)}
          </div>

          <Card className="monitor__timeline" title="Alertas por minuto (últimos 30 min)">
            <AlertTimeline timeline={data.timeline} />
          </Card>

          <Card className="monitor__feed" title="Últimas alertas" action={<Link to="/alertas" className="link-btn">Ver todas →</Link>}>
            <AlertFeed alerts={live.alerts.slice(0, 7)} onSelect={(a) => navigate('/alertas', { state: { select: a.id } })} />
          </Card>

          <Card className="monitor__top" title="Firmas más frecuentes">
            {data.topSignatures.length ? (
              <ol className="ranking">
                {data.topSignatures.map((s) => (
                  <li key={`${s.sensor}-${s.sid}`}>
                    <span className={`ranking__dot ranking__dot--${s.sensor}`} aria-hidden="true" />
                    <span className="ranking__label">{s.message}</span>
                    <strong>{formatNumber(s.count)}</strong>
                  </li>
                ))}
              </ol>
            ) : <p className="empty">Sin datos todavía.</p>}
            <h3 className="subhead">Orígenes con más alertas</h3>
            {data.topSources.length ? (
              <ol className="ranking">
                {data.topSources.map((s) => (
                  <li key={s.ip}><span className="ranking__label mono">{s.ip}</span><strong>{formatNumber(s.count)}</strong></li>
                ))}
              </ol>
            ) : <p className="empty">Sin datos todavía.</p>}
          </Card>
        </div>
      )}
    </>
  );
}
