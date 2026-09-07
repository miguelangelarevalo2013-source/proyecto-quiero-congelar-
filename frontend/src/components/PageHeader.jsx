export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      {subtitle ? <span>{subtitle}</span> : null}
    </div>
  )
}

export default PageHeader
