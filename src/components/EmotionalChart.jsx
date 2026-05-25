const emotionLabels = {
  feliz: 'Feliz',
  cansado: 'Cansado',
  triste: 'Triste',
  ansioso: 'Ansioso',
  sozinho: 'Sozinho',
  motivado: 'Motivado',
  sobrecarregado: 'Sobrecarregado',
}

function EmotionalChart({ items = [] }) {
  const counts = items.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + 1
    return acc
  }, {})

  const max = Math.max(1, ...Object.values(counts))
  const rows = Object.entries(emotionLabels).map(([emotion, label]) => ({
    emotion,
    label,
    value: counts[emotion] || 0,
  }))

  return (
    <div className="emotion-chart">
      {rows.map((row) => (
        <div className="chart-row" key={row.emotion}>
          <span>{row.label}</span>
          <div className="chart-track">
            <div
              className={`chart-bar ${row.emotion}`}
              style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }}
            />
          </div>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default EmotionalChart
