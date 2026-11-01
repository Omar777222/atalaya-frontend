import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { useIdsLive } from '../hooks/useIdsLive.js';
import { useNow } from '../hooks/useNow.js';
import { idsService } from '../api/idsService.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import CommandBlock from '../components/ui/CommandBlock.jsx';
import SensorBadge from '../components/ids/SensorBadge.jsx';
import LiveIndicator from '../components/ids/LiveIndicator.jsx';
import { DEMO_PHASES, DEMO_CHECKLIST } from '../constants/ids.js';
import { pad } from '../utils/format.js';

const TARGETS_KEY = 'atalaya_demo_targets';
const START_KEY = 'atalaya_demo_start';
const OBJECTIVE_LABEL = { icmp: 'Objetivo 1', sniffer: 'Objetivo 2', nmap: 'Objetivo 3', web: 'Ampliación' };

const readJson = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
};

const fill = (cmd, t) => cmd
  .replaceAll('{FRONT}', t.front || 'IP_PUBLICA_FRONTEND')
  .replaceAll('{BACK}', t.back || '10.0.128.10')
  .replaceAll('{DOMAIN}', t.domain || 'atalaya-zt.duckdns.org');

export default function DemoPage() {
  const { token } = useAuth();
  const { alerts } = useIdsLive();
  const now = useNow(1000);
  const { data } = useApiResource(() => idsService.setup(token), [token]);
  const [targets, setTargets] = useState(() => readJson(TARGETS_KEY) ?? { front: '', back: '', domain: '' });
  const [startAt, setStartAt] = useState(() => readJson(START_KEY));

  // Si el administrador no ha escrito nada, se usan los valores del .env del backend
  useEffect(() => {
    if (!data) return;
    setTargets((t) => ({
      front: t.front || (data.targets.frontendPublicIp !== 'IP_PUBLICA_FRONTEND' ? data.targets.frontendPublicIp : ''),
      back: t.back || data.targets.backendPrivateIp,
      domain: t.domain || data.targets.domain,
    }));
  }, [data]);

  const onTarget = (e) => {
    const next = { ...targets, [e.target.name]: e.target.value.trim() };
    setTargets(next);
    save(TARGETS_KEY, next);
  };

  const start = () => { const t = new Date().toISOString(); setStartAt(t); save(START_KEY, t); };
  const stop = () => { setStartAt(null); save(START_KEY, null); };

  // Una prueba está "detectada" cuando llega cada alerta esperada después de iniciar la demo
  const seen = useMemo(() => {
    const since = startAt ? new Date(startAt).getTime() : 0;
    const set = new Set();
    for (const a of alerts) if (new Date(a.timestamp).getTime() >= since) set.add(`${a.sensor}:${a.sid}`);
    return set;
  }, [alerts, startAt]);

  const allSteps = DEMO_PHASES.flatMap((p) => p.steps).filter((s) => s.expect.length);
  const doneSteps = allSteps.filter((s) => s.expect.every((e) => seen.has(`${e.sensor}:${e.sid}`))).length;
  const elapsed = startAt ? Math.max(0, Math.floor((now - new Date(startAt).getTime()) / 1000)) : 0;

  return (
    <>
      <PageHeader
        title="Demo en vivo"
        description="El guion de la presentación: quién ejecuta cada prueba, qué comando copiar y qué alerta debe aparecer. Cada paso se marca solo cuando el sensor la detecta."
        action={<div className="page-header__actions"><LiveIndicator /></div>}
      />

      <div className="demo">
        <Card className="demo__control">
          <div className="demo__control-row">
            <div className="demo__progress">
              <p className="demo__progress-label">{doneSteps} de {allSteps.length} pruebas detectadas</p>
              <div className="demo__bar" aria-hidden="true"><span style={{ width: `${(doneSteps / allSteps.length) * 100}%` }} /></div>
            </div>
            <div className="demo__timer">
              <span className="demo__timer-value mono">{startAt ? `${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)}` : '--:--'}</span>
              {startAt
                ? <Button variant="secondary" onClick={stop}>Terminar demo</Button>
                : <Button onClick={start}>Iniciar demo</Button>}
            </div>
          </div>
          {!startAt && <p className="note">Al iniciar, solo cuentan las alertas que lleguen desde ese momento. Así el profesor ve cómo se encienden en vivo.</p>}

          <div className="demo__targets">
            <label className="field">
              <span className="field__label">IP pública de ec2-frontend</span>
              <input className="field__input mono" name="front" value={targets.front} onChange={onTarget} placeholder="52.x.x.x (cambia en cada sesión del Lab)" />
            </label>
            <label className="field">
              <span className="field__label">IP privada de ec2-backend</span>
              <input className="field__input mono" name="back" value={targets.back} onChange={onTarget} />
            </label>
            <label className="field">
              <span className="field__label">Dominio</span>
              <input className="field__input mono" name="domain" value={targets.domain} onChange={onTarget} />
            </label>
          </div>
          {!targets.front && <Alert tone="info">Escribe la IP pública del frontend para que los comandos queden listos para copiar.</Alert>}

          <details className="demo__checklist">
            <summary>Antes de empezar (excepciones temporales del laboratorio)</summary>
            <ul>{DEMO_CHECKLIST.map((c) => <li key={c}>{c}</li>)}</ul>
          </details>
        </Card>

        {DEMO_PHASES.map((phase) => (
          <section key={phase.id} className={`demo__phase demo__phase--${phase.id}`}>
            <header className="demo__phase-head">
              <SensorBadge sensor={phase.id} />
              <h2>{phase.title}</h2>
              <p>{phase.lead}</p>
            </header>
            <ol className="steps">
              {phase.steps.map((step, i) => {
                const hits = step.expect.map((e) => ({ ...e, ok: seen.has(`${e.sensor}:${e.sid}`) }));
                const done = hits.length > 0 && hits.every((h) => h.ok);
                return (
                  <li key={step.id} className={`step ${done ? 'step--done' : ''} ${!hits.length ? 'step--manual' : ''}`}>
                    <span className="step__num" aria-hidden="true">
                      {done ? <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg> : i + 1}
                    </span>
                    <div className="step__body">
                      <div className="step__top">
                        <h3 className="step__title">{step.title}</h3>
                        <span className="step__where">{step.where}</span>
                        {step.objective && <span className="step__obj">{OBJECTIVE_LABEL[step.objective]}</span>}
                      </div>
                      {step.commands.map((c) => <CommandBlock key={c} command={fill(c, targets)} />)}
                      <p className="step__observe">{step.observe}</p>
                      {hits.length > 0 && (
                        <ul className="step__expect" aria-label="Alertas esperadas">
                          {hits.map((h) => (
                            <li key={`${h.sensor}-${h.sid}`} className={h.ok ? 'is-ok' : ''}>
                              <SensorBadge sensor={h.sensor} showKind={false} />
                              <span className="mono">SID {h.sid}</span>
                              <span>{h.ok ? 'Detectada' : 'Esperando…'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        <Card title="Cierre de la demo">
          <p className="note">
            Abre <Link to="/alertas">Alertas en vivo</Link>, selecciona una alerta de cada prueba y explica las tres preguntas del análisis:
            qué tráfico la provocó, qué regla la generó y por qué era esperable. Muestra el mismo aviso en el grupo de Telegram.
          </p>
        </Card>
      </div>
    </>
  );
}
