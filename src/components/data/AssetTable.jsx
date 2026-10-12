import Badge from '../ui/Badge.jsx';

const EXPOSURE_TONE = {
  Pública: 'warn',
  'Solo vía ALB': 'info',
  Restringida: 'info',
  Segmentada: 'info',
  Privada: 'ok',
  'Sin internet': 'ok',
  Interna: 'neutral',
};

export default function AssetTable({ items }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Componente</th>
            <th scope="col">Zona</th>
            <th scope="col">Dirección</th>
            <th scope="col">Exposición</th>
            <th scope="col">Controles</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="table__primary">{a.name}</span>
                <span className="table__secondary">{a.type}</span>
              </td>
              <td>{a.zone}</td>
              <td className="mono">{a.address}</td>
              <td><Badge tone={EXPOSURE_TONE[a.exposure] ?? 'neutral'}>{a.exposure}</Badge></td>
              <td className="table__tags">{a.controls.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
