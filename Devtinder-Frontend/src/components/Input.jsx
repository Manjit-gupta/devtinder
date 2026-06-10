export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-secondary uppercase tracking-wide">{label}</label>}
      <input className={`input-field ${error ? 'border-danger focus:ring-danger' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
