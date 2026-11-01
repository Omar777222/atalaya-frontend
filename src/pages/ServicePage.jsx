import { Link } from 'react-router-dom';
import Logo from '../components/brand/Logo.jsx';

const STEPS = [
  { title: 'Conectamos los sensores', text: 'Instalamos Suricata en la red de tu sitio y Snort en el servidor de tu aplicación, con reglas hechas para tu caso.' },
  { title: 'Detectamos en tiempo real', text: 'Escaneos, ataques web, fuerza bruta y datos sin cifrar se identifican en segundos y se clasifican por prioridad.' },
  { title: 'Te avisamos y respondemos', text: 'El equipo recibe cada alerta en Telegram, la analiza y tú ves el estado de tu protección en tu portal.' },
];

const CONTROLS = [
  ['Firewall de aplicación', 'AWS WAF con reglas contra inyección SQL, XSS, IPs de mala reputación y exceso de peticiones.'],
  ['Red segmentada', 'Frontend y backend en redes separadas; el servidor de datos no tiene salida a internet.'],
  ['Detección doble', 'Suricata (NIDS) en la entrada y Snort (HIDS) en el servidor: si un ataque pasa una capa, la otra lo ve.'],
  ['Acceso verificado', 'Sesiones con JWT de 15 minutos, roles con mínimo privilegio y verificación en cada petición.'],
  ['Freno a la fuerza bruta', 'Fail2Ban bloquea por 10 minutos la IP que falla 5 inicios de sesión.'],
  ['Cifrado y encabezados', 'HTTPS con certificado válido, HSTS, CSP y encabezados de seguridad con calificación A+.'],
  ['Avisos inmediatos', 'Alertas e inicios de sesión sospechosos llegan al grupo de Telegram del equipo.'],
  ['Auditoría', 'Registro de quién entra, quién falla y quién intenta acceder a lo que no le corresponde.'],
];

const PLANS = [
  { name: 'Básico', for: 'Negocios que empiezan en línea', items: ['Suricata en la entrada de tu sitio', 'Reglas para escaneos y ataques web', 'Reporte semanal'] },
  { name: 'Profesional', for: 'Tiendas en línea y sistemas con usuarios', featured: true, items: ['Todo lo del plan Básico', 'Snort en el servidor de la aplicación', 'Avisos en Telegram 24/7', 'Portal "Mi sitio" para el cliente'] },
  { name: 'Empresa', for: 'Operaciones críticas', items: ['Todo lo del plan Profesional', 'Modo IPS (bloqueo automático)', 'Integración con SIEM', 'Plan de respuesta a incidentes'] },
];

// Página pública: la propuesta de servicio de Atalaya (concepto del proyecto)
export default function ServicePage() {
  return (
    <div className="service">
      <header className="service__nav">
        <div className="service__brand"><Logo size={34} inverted /><span>Atalaya SOC</span></div>
        <Link to="/login" className="btn btn--primary">Iniciar sesión</Link>
      </header>

      <section className="service__hero">
        <p className="service__eyebrow">Monitoreo de seguridad gestionado</p>
        <h1>Vigilamos tu sitio web para que tú te ocupes de tu negocio</h1>
        <p className="service__lead">
          Atalaya es un centro de operaciones de seguridad (SOC) para pequeños negocios en la nube: detecta intrusos con dos sensores,
          avisa al equipo en segundos y te muestra en un portal sencillo qué pasó y qué se hizo.
        </p>
        <div className="service__cta">
          <Link to="/login" className="btn btn--beacon">Entrar al portal</Link>
          <a href="#como-funciona" className="btn btn--ghost-inverted service__ghost">Cómo funciona</a>
        </div>
      </section>

      <main className="service__body">
        <section id="como-funciona" className="service__section">
          <h2>Cómo funciona</h2>
          <ol className="service__steps">
            {STEPS.map((s, i) => (
              <li key={s.title}><span className="service__step-num">{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </section>

        <section className="service__section">
          <h2>Seguridad incluida desde el primer día</h2>
          <div className="service__controls">
            {CONTROLS.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section className="service__section">
          <h2>Planes</h2>
          <div className="service__plans">
            {PLANS.map((p) => (
              <div key={p.name} className={`plan ${p.featured ? 'plan--featured' : ''}`}>
                {p.featured && <span className="plan__tag">El que usamos en esta demo</span>}
                <h3>{p.name}</h3>
                <p className="plan__for">{p.for}</p>
                <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="service__footer">
        Propuesta de servicio · Proyecto académico del Diplomado en Ciberseguridad · Arquitectura Zero Trust + IDS en AWS
      </footer>
    </div>
  );
}
