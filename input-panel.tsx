'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RoiInputs } from '@/lib/roi'

type FieldConfig = {
  key: keyof RoiInputs
  label: string
  suffix?: string
  prefix?: string
  step?: number
  hint?: string
}

type Section = {
  title: string
  fields: FieldConfig[]
}

const SECTIONS: Section[] = [
  {
    title: 'Fixtures',
    fields: [
      { key: 'fixtures', label: 'Number of fixtures', step: 1 },
      { key: 'existingWatts', label: 'Existing watts / fixture', suffix: 'W', step: 5 },
      { key: 'ledWatts', label: 'New LED watts / fixture', suffix: 'W', step: 5 },
    ],
  },
  {
    title: 'Operation',
    fields: [
      { key: 'hoursPerDay', label: 'Operating hours / day', suffix: 'h', step: 0.5 },
      { key: 'daysPerYear', label: 'Operating days / year', suffix: 'd', step: 1 },
      { key: 'energyRate', label: 'Electricity rate', prefix: '$', suffix: '/kWh', step: 0.01 },
    ],
  },
  {
    title: 'Investment',
    fields: [
      { key: 'costPerFixture', label: 'Installed cost / fixture', prefix: '$', step: 5 },
      { key: 'rebatePerFixture', label: 'Rebate / incentive per fixture', prefix: '$', step: 5 },
      {
        key: 'annualMaintenanceSavings',
        label: 'Annual maintenance savings',
        prefix: '$',
        step: 50,
        hint: 'Relamping labor & parts avoided per year',
      },
    ],
  },
]

export function InputPanel({
  values,
  onChange,
}: {
  values: RoiInputs
  onChange: (key: keyof RoiInputs, value: number) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      {SECTIONS.map((section) => (
        <fieldset key={section.title} className="flex flex-col gap-4">
          <legend className="mb-1 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {section.title}
            <span aria-hidden className="h-px flex-1 bg-border" />
          </legend>
          {section.fields.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label
                htmlFor={field.key}
                className="text-sm font-medium text-foreground"
              >
                {field.label}
              </Label>
              <div className="relative">
                {field.prefix ? (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                    {field.prefix}
                  </span>
                ) : null}
                <Input
                  id={field.key}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={field.step ?? 1}
                  value={Number.isFinite(values[field.key]) ? values[field.key] : ''}
                  onChange={(e) => {
                    const raw = e.target.value
                    onChange(field.key, raw === '' ? 0 : Number.parseFloat(raw))
                  }}
                  className={`font-mono tabular-nums ${field.prefix ? 'pl-7' : ''} ${
                    field.suffix ? 'pr-14' : ''
                  }`}
                />
                {field.suffix ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                    {field.suffix}
                  </span>
                ) : null}
              </div>
              {field.hint ? (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              ) : null}
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  )
}
