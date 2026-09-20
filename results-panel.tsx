'use client'

import { Card } from '@/components/ui/card'
import { CashflowChart } from '@/components/cashflow-chart'
import {
  buildCashflow,
  formatCurrency,
  formatKwh,
  formatNumber,
  formatPayback,
  type RoiInputs,
  type RoiResults,
} from '@/lib/roi'
import { CarFront, Leaf, TrendingUp, Trees, Wallet, Zap } from 'lucide-react'

function Headline({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'amber' | 'green'
}) {
  const valueColor =
    accent === 'green'
      ? 'text-positive'
      : accent === 'amber'
        ? 'text-accent-foreground'
        : 'text-foreground'
  return (
    <div className="flex flex-col gap-1 p-5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-3xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </span>
      {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
    </div>
  )
}

function EnergyBar({ results }: { results: RoiResults }) {
  const max = Math.max(results.existingKwh, results.ledKwh, 1)
  const rows = [
    {
      label: 'Existing',
      kwh: results.existingKwh,
      cost: results.existingAnnualCost,
      color: 'bg-muted-foreground/60',
    },
    {
      label: 'LED',
      kwh: results.ledKwh,
      cost: results.ledAnnualCost,
      color: 'bg-accent',
    },
  ]
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-foreground">{row.label}</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatKwh(row.kwh)} · {formatCurrency(row.cost)}/yr
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full ${row.color}`}
              style={{ width: `${(row.kwh / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  )
}

export function ResultsPanel({
  inputs,
  results,
}: {
  inputs: RoiInputs
  results: RoiResults
}) {
  const cashflow = buildCashflow(inputs, results, 10)
  const positive = results.annualTotalSavings > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Headline metrics */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
          <Headline
            label="Payback"
            value={formatPayback(results.paybackYears)}
            sub="to recover net cost"
            accent="amber"
          />
          <Headline
            label="10-yr ROI"
            value={positive ? `${formatNumber(results.roi10yr)}%` : '—'}
            sub="return on net investment"
            accent="green"
          />
          <Headline
            label="Annual savings"
            value={formatCurrency(results.annualTotalSavings)}
            sub="energy + maintenance"
            accent="green"
          />
          <Headline
            label="Net investment"
            value={formatCurrency(results.netInvestment)}
            sub={`after ${formatCurrency(results.totalRebate)} rebates`}
          />
        </div>
      </Card>

      {/* Cashflow chart */}
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-positive" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              10-year cumulative cash position
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-positive" aria-hidden />
              After upgrade
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded bg-muted-foreground"
                style={{ backgroundImage: 'none' }}
                aria-hidden
              />
              Keep existing
            </span>
          </div>
        </div>
        <CashflowChart data={cashflow} paybackYears={results.paybackYears} />
        <p className="text-xs text-muted-foreground">
          The upgrade line starts negative (upfront cost) and crosses zero at
          payback. After that, every year is net gain versus the do-nothing path.
        </p>
      </Card>

      {/* Energy + environment */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-accent-foreground" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Annual energy use
            </h2>
          </div>
          <EnergyBar results={results} />
          <div className="rounded-md bg-secondary/60 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Energy avoided / yr</span>
              <span className="font-mono font-semibold tabular-nums text-positive">
                {formatKwh(results.energySavedKwh)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center gap-2">
            <Leaf className="size-4 text-positive" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">
              Environmental impact
            </h2>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-3xl font-semibold tabular-nums text-positive">
              {formatNumber(results.co2SavedTonsPerYear, 1)} t
            </span>
            <span className="text-xs text-muted-foreground">
              CO₂ avoided per year
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-2.5">
              <Trees className="size-5 shrink-0 text-positive" aria-hidden />
              <div className="leading-tight">
                <div className="font-mono text-base font-semibold tabular-nums text-foreground">
                  {formatNumber(results.treesEquivalent)}
                </div>
                <div className="text-xs text-muted-foreground">trees / yr</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-2.5">
              <CarFront className="size-5 shrink-0 text-positive" aria-hidden />
              <div className="leading-tight">
                <div className="font-mono text-base font-semibold tabular-nums text-foreground">
                  {formatNumber(results.carsEquivalent, 1)}
                </div>
                <div className="text-xs text-muted-foreground">cars off road</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial breakdown */}
      <Card className="gap-2 p-5">
        <div className="mb-1 flex items-center gap-2">
          <Wallet className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">
            Financial breakdown
          </h2>
        </div>
        <div className="divide-y divide-border">
          <Line
            label="Annual energy savings"
            value={formatCurrency(results.annualEnergySavings)}
          />
          <Line
            label="Annual maintenance savings"
            value={formatCurrency(results.annualMaintenanceSavings)}
          />
          <Line
            label="Gross project cost"
            value={formatCurrency(results.grossInvestment)}
          />
          <Line label="Rebates & incentives" value={`− ${formatCurrency(results.totalRebate)}`} />
          <Line label="Net investment" value={formatCurrency(results.netInvestment)} />
          <Line
            label="Net savings over 10 years"
            value={formatCurrency(results.netSavings10yr)}
          />
        </div>
      </Card>
    </div>
  )
}
