import { useAuth } from '../hooks/useAuth.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { dashboardService } from '../api/dashboardService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CheckList from '../components/security/CheckList.jsx';
import ActivitySummary from '../components/security/ActivitySummary.jsx';
import DefenseLayers from '../components/security/DefenseLayers.jsx';
import { ROLE_LABELS } from '../constants/security.js';
import { formatTime, shortId } from '../utils/format.js';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { data, error, loading, reload } = useApiResource(() => dashboardService.get(token), [token]);
  const passed = data?.checks.filter((c) => c.passed).length ?? 0;

  return (
    <>
      <PageHeader
        title={`Hola, ${user.displayName}`}
        description="Cada vez que abres esta página, el servidor vuelve a verificar tu identidad, tu token y tu rol."
        action={<Button variant="secondary" onClick={reload} loading={loading}>Verificar de nuevo</Button>}
      />

      <Alert kind={error?.kind}>{error?.message}</Alert>
      {!data && loading && <Spinner label="Consultando al backend por la red privada…" />}

      {data && (
        <div className="dashboard">
          <Card
            className="dashboard__checks"
            title={`Verificaciones de esta petición: ${passed} de ${data.checks.length}`}
          >
            <CheckList checks={data.checks} />
          </Card>

          <Card title="Actividad de seguridad en 24 horas">
            <ActivitySummary activity={data.activity} />
          </Card>

          <Card title="Tu sesión">
            <dl className="facts">
              <div><dt>Usuario</dt><dd>{data.user.username}</dd></div>
              <div><dt>Rol</dt><dd>{ROLE_LABELS[data.user.role]}</dd></div>
              <div><dt>Inicio</dt><dd>{formatTime(data.session.issuedAt)}</dd></div>
              <div><dt>Expira</dt><dd>{formatTime(data.session.expiresAt)}</dd></div>
              <div><dt>ID de sesión</dt><dd className="mono">{shortId(data.session.id)}</dd></div>
            </dl>
          </Card>

          <Card title="Servidor que respondió">
            <dl className="facts">
              <div><dt>Host</dt><dd>{data.backend.hostname}</dd></div>
              <div><dt>IP privada</dt><dd className="mono">{data.backend.privateIps.join(', ') || '—'}</dd></div>
              <div><dt>Activo desde hace</dt><dd>{data.backend.uptimeMinutes} min</dd></div>
              <div><dt>Hora del servidor</dt><dd>{formatTime(data.backend.serverTime)}</dd></div>
            </dl>
          </Card>

          <Card className="dashboard__layers" title="Capas de defensa en profundidad">
            <DefenseLayers />
          </Card>
        </div>
      )}
    </>
  );
}
