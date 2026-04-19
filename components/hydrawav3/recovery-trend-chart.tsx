"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export type TrendPoint = { label: string; score: number; baseline?: number }

export function RecoveryTrendChart({
  data,
  height = 240,
  showBaseline = true,
}: {
  data: TrendPoint[]
  height?: number
  showBaseline?: boolean
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C97A56" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#C97A56" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#162532" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#162532" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#9CA3AF"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[40, 100]}
            ticks={[40, 60, 80, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "#162532",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              padding: "8px 10px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
            cursor={{ stroke: "#C97A56", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          {showBaseline && (
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#162532"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#baselineFill)"
              name="Baseline"
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#C97A56"
            strokeWidth={2.5}
            fill="url(#recoveryFill)"
            name="Recovery"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
