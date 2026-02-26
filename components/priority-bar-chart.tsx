'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface PriorityChartProps {
  data?: {
    labels: string[]
    data: number[]
  }
  isLoading?: boolean
}

const COLORS = ['#d8d3d4', '#FFB26B', '#FF7D7D', '#D80032']

export function PriorityBarChart({
  data,
  isLoading = false,
}: PriorityChartProps) {
  const chartData = data?.labels.map((label, index) => ({
    name: label,
    total: data?.data[index],
  }))

  return isLoading ? (
    <div className="h-[300px] w-full flex items-center justify-center animate-pulse">
      <p>Carregando as informações...</p>
    </div>
  ) : (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {chartData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
