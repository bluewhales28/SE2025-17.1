"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ScoreHistogramProps {
    bins: number[]
    frequencies: number[]
}

export function ScoreHistogram({ bins, frequencies }: ScoreHistogramProps) {
    // Transform data for Recharts
    const data = bins.slice(0, -1).map((bin, index) => ({
        range: `${bin.toFixed(0)}-${bins[index + 1]?.toFixed(0) || '100'}`,
        frequency: frequencies[index] || 0
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="range" 
                    label={{ value: 'Score Range', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" fill="#4F81BD" name="Number of Students" />
            </BarChart>
        </ResponsiveContainer>
    )
}

