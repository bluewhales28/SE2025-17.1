"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ProgressTrendChartProps {
    data: number[]
    title?: string
}

export function ProgressTrendChart({ data, title = "Progress Trend" }: ProgressTrendChartProps) {
    const chartData = data.map((score, index) => ({
        attempt: `Attempt ${index + 1}`,
        score: Number(score.toFixed(2))
    }))

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                No progress data available
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#4F81BD" 
                        strokeWidth={2}
                        name="Score (%)"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

