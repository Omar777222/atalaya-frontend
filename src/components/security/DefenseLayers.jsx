import { DEFENSE_LAYERS } from '../../constants/security.js';

export default function DefenseLayers() {
  const groups = [...new Set(DEFENSE_LAYERS.map((l) => l.group))];
  return (
    <div className="layers">
      {groups.map((group) => (
        <div key={group} className="layers__group">
          <h3 className="layers__group-title">{group}</h3>
          <ul>
            {DEFENSE_LAYERS.filter((l) => l.group === group).map((l) => (
              <li key={l.name} className="layers__item">
                <strong>{l.name}</strong>
                <span>{l.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
