// Mapa de la arquitectura con los dos sensores: dónde mira cada uno.
export default function ArchitectureMap({ targets }) {
  return (
    <div className="arch" role="img" aria-label="Kali e internet llegan al ALB y WAF; ec2-frontend tiene Suricata; por el peering se llega a ec2-backend con Snort; las alertas salen a Telegram">
      <div className="arch__node arch__node--outside">
        <strong>Internet / Kali</strong>
        <span>Atacante de la prueba</span>
      </div>
      <span className="arch__arrow" aria-hidden="true" />
      <div className="arch__node">
        <strong>AWS WAF + ALB</strong>
        <span>{targets?.domain ?? 'dominio'}</span>
      </div>
      <span className="arch__arrow" aria-hidden="true" />
      <div className="arch__zone arch__zone--suricata">
        <p className="arch__zone-title">VPC Frontend · 10.0.0.0/17</p>
        <div className="arch__node arch__node--suricata">
          <strong>ec2-frontend</strong>
          <span>Nginx · Suricata (NIDS) · Agente Telegram</span>
          <span className="mono">{targets?.frontendPrivateIp}</span>
        </div>
      </div>
      <span className="arch__arrow arch__arrow--peering" aria-hidden="true"><em>peering</em></span>
      <div className="arch__zone arch__zone--snort">
        <p className="arch__zone-title">VPC Backend · 10.0.128.0/17</p>
        <div className="arch__node arch__node--snort">
          <strong>ec2-backend</strong>
          <span>API Node · Snort (HIDS)</span>
          <span className="mono">{targets?.backendPrivateIp}</span>
        </div>
      </div>
    </div>
  );
}
