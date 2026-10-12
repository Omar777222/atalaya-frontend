// Atalaya: una torre de vigilancia con su faro encendido
export default function Logo({ size = 36, inverted = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <rect width="32" height="32" rx="8" fill={inverted ? '#FFFFFF' : '#0F2A3F'} />
      <path d="M13 27h6l-1.4-13h-3.2z" fill={inverted ? '#0F2A3F' : '#FFFFFF'} />
      <rect x="12.4" y="10" width="7.2" height="4" rx="1" fill={inverted ? '#0F2A3F' : '#FFFFFF'} />
      <circle cx="16" cy="7.2" r="2.2" fill="#E3A33C" />
    </svg>
  );
}
