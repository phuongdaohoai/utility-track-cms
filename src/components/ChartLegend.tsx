interface ChartLegendProps {
  items: {
    name: string
    color: string
  }[]
}

export default function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="max-h-32 overflow-y-auto border-t pt-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
        {items.map(item => (
          <div
            key={item.name}
            className="flex items-center gap-2 truncate"
            title={item.name}
          >
            <span
              className="h-3 w-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-gray-700">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
