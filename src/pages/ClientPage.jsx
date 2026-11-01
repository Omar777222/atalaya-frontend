import { useAuth } from '../hooks/useAuth.js';
import { usePolling } from '../hooks/usePolling.js';
import { useNow } from '../hooks/useNow.js';
import { clientService } from '../api/clientService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatNumber, timeAgo } from '../utils/format.js';

const STATUS = {
  protegido: { title: 'Tu sitio está protegido', text: 'Los dos sensores están activos y no hay ataques graves en la última hora.', tone: 'ok' },
  atencion: { title: 'Detectamos actividad de riesgo', text: 'Hubo ataques de prioridad alta en la última hora. El equipo de seguridad ya fue avisado por Telegram.', tone: 'warn' },
  degradado: { title: 'Un sensor necesita revisión', text: 'Uno de los sensores no está funcionando. El equipo de seguridad está trabajando en ello.', tone: 'danger' },
  'sin-datos': { title: 'Esperando datos de los sensores', text: 'Todavía no recibimos el estado de los dos sensores.', tone: 'neutral' },
};
const SENSOR_STATE = { activo: ['ok', 'Activo'], falla: ['danger', 'Con falla'], 'sin-datos': ['neutral', 'Sin datos'] };
const dayFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: '2-digit' });

// Portal del cliente del servicio: lenguaje sencillo, sin IPs internas ni reglas.
export default function ClientPage() {
  const { token, user } = useAuth();
  const now = useNow(10000);
  const { data, error, loading } = usePolling(() => clientService.summary(token), { intervalMs: 5000, deps: [token] });
  const st = data ? STATUS[data.status] : null;
  const max = data ? Math.max(1, ...data.days.map((d) => d.count)) : 1;

  return (
    <>
      <PageHeader
        title="Mi sitio"
        description={data ? `Estado de protección de ${data.service.site} · Plan ${data.service.plan} de ${data.service.name}` : 'Estado de protección de tu sitio'}
      />
      {user.role === 'admin' && <Alert tone="info">Estás viendo el portal tal como lo ve el cliente del servicio.</Alert>}
      <Alert kind={error?.kind}>{error?.message}</Alert>
      {!data && loading && <Spinner label="Consultando el estado de tu sitio…" />}

      {data && (
        <div className="client">
          <section className={`client__status client__status--${st.tone}`}>
            <svg viewBox="0 0 48 48" aria-hidden="true" className="client__shield">
              <path d="M24 4l16 6v12c0 10-6.8 18.5-16 22-9.2-3.5-16-12-16-22V10z" />
              {data.status === 'protegido' ? <path d="M16 24l6 6 11-12" className="client__mark" /> : <path d="M24 15v12M24 33v.5" className="client__mark" />}
            </svg>
            <div>
              <h2>{st.title}</h2>
              <p>{st.text}</p>
            </div>
          </section>

          <div className="client__stats">
            <div className="kpi kpi--ink"><p className="kpi__label">Ataques detectados hoy</p><p className="kpi__value">{formatNumber(data.stats.today)}</p></div>
            <div className="kpi kpi--beacon"><p className="kpi__label">Últimos 7 días</p><p className="kpi__value">{formatNumber(data.stats.week)}</p></div>
            <div className="kpi kpi--snort"><p className="kpi__label">Orígenes distintos</p><p className="kpi__value">{formatNumber(data.stats.sources)}</p></div>
            <div className="kpi kpi--suricata"><p className="kpi__label">Sensores activos</p><p className="kpi__value">{data.sensors.filter((s) => s.state === 'activo').length} de {data.sensors.length}</p></div>
          </div>

          <Card className="client__week" title="Ataques por día">
            <div className="week" role="img" aria-label={`${data.stats.week} ataques en los últimos 7 días`}>
              {data.days.map((d) => (
                <div key={d.day} className="week__col">
                  <span className="week__value">{d.count}</span>
                  <span className="week__bar" style={{ height: `${(d.count / max) * 100}%` }} />
                  <span className="week__label">{dayFmt.format(new Date(d.day))}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="client__sensors" title="Tu protección">
            <ul className="client__list">
              {data.sensors.map((s) => {
                const [tone, label] = SENSOR_STATE[s.state];
                return <li key={s.id}><span>{s.name}</span><Badge tone={tone}>{label}</Badge></li>;
              })}
              <li><span>Firewall de aplicación (AWS WAF)</span><Badge tone="ok">Incluido</Badge></li>
              <li><span>Bloqueo de intentos de contraseña (Fail2Ban)</span><Badge tone="ok">Incluido</Badge></li>
              <li><span>Avisos al equipo por Telegram</span><Badge tone="ok">Incluido</Badge></li>
            </ul>
            <p className="note">Contacto: {data.service.contact}</p>
          </Card>

          <Card className="client__incidents" title="Qué detectamos y qué hicimos">
            {data.incidents.length ? (
              <ul className="incidents">
                {data.incidents.map((i) => (
                  <li key={i.id} className={`incident ${i.high ? 'incident--high' : ''}`}>
                    <div className="incident__head">
                      <h3>{i.label}</h3>
                      <span className="incident__meta">{formatNumber(i.count)} {i.count === 1 ? 'evento' : 'eventos'} · {timeAgo(i.lastAt, now)}</span>
                      {i.high && <Badge tone="danger">Prioridad alta</Badge>}
                    </div>
                    <p><strong>Qué pasó:</strong> {i.impact}</p>
                    <p><strong>Qué hicimos:</strong> {i.action}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="empty">Sin incidentes en los últimos 7 días.</p>}
          </Card>
        </div>
      )}
    </>
  );
}
