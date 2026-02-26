'use client'

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface StatusChartProps {
  data?: {
    labels: string[]
    data: number[]
  }
  isLoading?: boolean
}

const COLORS = ['#d8d3d4', '#FFBB28', '#00C49F', '#ff4f42']

export function StatusPieChart({ data, isLoading }: StatusChartProps) {
  const chartData = data?.labels.map((label, index) => ({
    name: label,
    value: data?.data[index],
  }))

  return isLoading ? (
    <div className="h-[300px] w-full flex items-center justify-center animate-pulse">
      <p>Carregando as informações...</p>
    </div>
  ) : (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => (value > 0 ? `${name}` : '')}
          >
            {chartData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
