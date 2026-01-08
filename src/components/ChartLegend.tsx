interface ChartLegendProps {
  items: {
    name: string
    color: string
  }[]
}

export default function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="max-h-24 overflow-y-auto border-t pt-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
