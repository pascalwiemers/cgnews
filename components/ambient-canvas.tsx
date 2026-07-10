export function AmbientCanvas() {
  return (
    <div className="ambient-canvas" aria-hidden="true">
      <div className="ambient-blob ambient-blob-primary" />
      <div className="ambient-blob ambient-blob-secondary" />
      <div className="ambient-blob ambient-blob-tertiary" />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
    </div>
  )
}
