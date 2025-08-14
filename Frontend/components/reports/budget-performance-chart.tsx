"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"

interface BudgetPerformanceChartProps {
  data: Array<{
    category: string
    budgeted: number
    spent: number
    variance: number
  }>
}

export function BudgetPerformanceChart({ data }: BudgetPerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(value))
  }

  const getBarColor = (variance: number) => {
    if (variance > 0) return "#ef4444" // Over budget - red
    if (variance > -100) return "#f59e0b" // Close to budget - yellow
    return "#22c55e" // Under budget - green
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Budget Performance</CardTitle>
        <CardDescription>How well you're sticking to your budgets by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "variance") {
                  const variance = value as number
                  return [
                    `${variance > 0 ? "+" : ""}${formatCurrency(variance)}`,
                    variance > 0 ? "Over Budget" : "Under Budget",
                  ]
                }
                return [formatCurrency(value as number), name]
              }}
            />
            <Legend />
            <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
            <Bar dataKey="spent" fill="#8b5cf6" name="Spent" />
            <Bar dataKey="variance" name="Variance">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.variance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
