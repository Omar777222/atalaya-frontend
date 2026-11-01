import { RULE_PARTS, OPTION_HELP } from '../../constants/ids.js';

// Separa una regla en encabezado y opciones respetando las comillas
export function parseRule(text) {
  const open = text.indexOf('(');
  const head = text.slice(0, open).trim().split(/\s+/);
  const body = text.slice(open + 1, text.lastIndexOf(')'));
  const options = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === '"' && body[i - 1] !== '\\') quoted = !quoted;
    if (ch === ';' && !quoted) {
      if (current.trim()) options.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) options.push(current.trim());
  const [action, protocol, srcIp, srcPort, direction, dstIp, dstPort] = head;
  return {
    head: { action, protocol, source: `${srcIp} ${srcPort}`, direction, destination: `${dstIp} ${dstPort}` },
    options: options.map((o) => {
      const idx = o.indexOf(':');
      return idx === -1 ? { key: o, value: '' } : { key: o.slice(0, idx).trim(), value: o.slice(idx + 1).trim() };
    }),
  };
}

export default function RuleAnatomy({ rule }) {
  const { head, options } = parseRule(rule.text);
  return (
    <div className="anatomy">
      <div className="anatomy__head">
        {['action', 'protocol', 'source', 'direction', 'destination'].map((part) => (
          <div key={part} className={`anatomy__part anatomy__part--${part}`}>
            <code>{head[part]}</code>
            <span>{RULE_PARTS[part].label}</span>
          </div>
        ))}
        <div className="anatomy__part anatomy__part--options">
          <code>( … )</code>
          <span>{RULE_PARTS.options.label}</span>
        </div>
      </div>
      <dl className="anatomy__options">
        {options.map((o, i) => (
          <div key={`${o.key}-${i}`} className={['msg', 'sid', 'rev'].includes(o.key) ? 'is-key' : ''}>
            <dt><code>{o.key}{o.value ? `:${o.value}` : ''}</code></dt>
            <dd>{OPTION_HELP[o.key] ?? 'Opción de detección.'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
