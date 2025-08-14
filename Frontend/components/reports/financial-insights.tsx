"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, DollarSign } from "lucide-react"

interface FinancialInsightsProps {
  insights: Array<{
    id: string
    type: "positive" | "negative" | "warning" | "info"
    title: string
    description: string
    value?: string
    trend?: "up" | "down"
  }>
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "negative":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Target className="h-5 w-5 text-blue-600" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start space-x-3 p-4 rounded-lg border">
              {getIcon(insight.type)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{insight.title}</h4>
                  {insight.trend && (
                    <div className="flex items-center">
                      {insight.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                {insight.value && (
                  <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                    {insight.value}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
