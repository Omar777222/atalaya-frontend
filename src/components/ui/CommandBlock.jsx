import CopyButton from './CopyButton.jsx';

export default function CommandBlock({ command }) {
  return (
    <div className="cmd">
      <code className="cmd__text">{command}</code>
      <CopyButton text={command.replace(/\s+#.*$/, '')} />
    </div>
  );
}
