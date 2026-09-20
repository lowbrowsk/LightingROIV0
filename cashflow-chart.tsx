'use client'

import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CashflowPoint } from '@/lib/roi'
import { formatCurrency } from '@/lib/roi'

function compactCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `${sign}$${abs.toFixed(0)}`
}

export function CashflowChart({
  data,
  paybackYears,
}: {
  data: CashflowPoint[]
  paybackYears: number | null
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="upgradeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-positive)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-positive)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            tickFormatter={(y) => `Y${y}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            tickFormatter={compactCurrency}
          />
          <Tooltip
            cursor={{ stroke: 'var(--color-border)' }}
            contentStyle={{
              background: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
            }}
            labelFormatter={(y) => `Year ${y}`}
            formatter={(value: number, name) => [
              formatCurrency(value),
              name === 'upgrade' ? 'After LED upgrade' : 'Keep existing',
            ]}
          />
          <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeWidth={1} />
          {paybackYears !== null && Number.isFinite(paybackYears) && paybackYears <= 10 ? (
            <ReferenceLine
              x={Math.round(paybackYears)}
              stroke="var(--color-accent)"
              strokeDasharray="4 4"
              label={{
                value: 'Payback',
                position: 'top',
                fill: 'var(--color-accent-foreground)',
                fontSize: 11,
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="upgrade"
            stroke="var(--color-positive)"
            strokeWidth={2}
            fill="url(#upgradeFill)"
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
