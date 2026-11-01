import { useState } from 'react';

export default function CopyButton({ text, label = 'Copiar' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      setDone(false);
    }
  };
  return (
    <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
      {done ? 'Copiado' : label}
    </button>
  );
}
