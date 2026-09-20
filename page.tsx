'use client'

import { useMemo, useState } from 'react'
import { Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputPanel } from '@/components/input-panel'
import { ResultsPanel } from '@/components/results-panel'
import { computeRoi, defaultInputs, type RoiInputs } from '@/lib/roi'

export default function Page() {
  const [inputs, setInputs] = useState<RoiInputs>(defaultInputs)

  const results = useMemo(() => computeRoi(inputs), [inputs])

  const handleChange = (key: keyof RoiInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(value) ? value : 0 }))
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Lightbulb className="size-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-foreground">Lumen ROI</h1>
              <p className="text-xs text-muted-foreground">
                Commercial LED upgrade payback calculator
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInputs(defaultInputs)}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="size-4" aria-hidden />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            See what an LED retrofit really pays back.
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground md:text-base">
            Enter your facility&apos;s current lighting, run hours, and project
            cost. Everything recalculates live — energy, dollars, payback, and
            carbon.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
          <Card className="p-5 lg:sticky lg:top-6">
            <InputPanel values={inputs} onChange={handleChange} />
          </Card>
          <ResultsPanel inputs={inputs} results={results} />
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          Estimates for planning only. Energy figures assume constant run hours
          and a grid emission factor of 0.386 kg CO₂/kWh (U.S. average). Actual
          savings vary with utility rates, controls, and local incentives.
        </p>
      </section>
    </main>
  )
}
