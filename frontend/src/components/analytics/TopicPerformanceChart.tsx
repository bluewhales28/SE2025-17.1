"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface TopicPerformanceChartProps {
    data: Record<string, number>
    title?: string
}

const COLORS = ['#4F81BD', '#9BBB59', '#F79646', '#8064A2', '#4BACC6', '#C0504D']

export function TopicPerformanceChart({ data, title = "Topic Performance" }: TopicPerformanceChartProps) {
    const chartData = Object.entries(data).map(([topic, score]) => ({
        topic,
        score: Number(score.toFixed(2))
    }))

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                No data available
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="topic" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                    />
                    <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Average Score (%)">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

