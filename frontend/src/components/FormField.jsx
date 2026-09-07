export function FormField({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="field-group">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

export default FormField
