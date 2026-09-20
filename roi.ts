export type RoiInputs = {
  fixtures: number
  existingWatts: number
  ledWatts: number
  hoursPerDay: number
  daysPerYear: number
  energyRate: number // $ per kWh
  costPerFixture: number // installed cost per LED fixture
  rebatePerFixture: number // incentive per fixture
  annualMaintenanceSavings: number // $ saved per year (relamping/labor)
}

export const defaultInputs: RoiInputs = {
  fixtures: 120,
  existingWatts: 150,
  ledWatts: 55,
  hoursPerDay: 12,
  daysPerYear: 312,
  energyRate: 0.14,
  costPerFixture: 95,
  rebatePerFixture: 20,
  annualMaintenanceSavings: 1200,
}

// EPA average U.S. grid emission factor.
const KG_CO2_PER_KWH = 0.386
const KG_CO2_PER_TREE_YEAR = 21.77 // CO2 sequestered by one mature tree per year
const KG_CO2_PER_CAR_YEAR = 4600 // avg passenger vehicle per year

export type RoiResults = {
  existingKwh: number
  ledKwh: number
  energySavedKwh: number
  annualEnergySavings: number
  annualMaintenanceSavings: number
  annualTotalSavings: number
  grossInvestment: number
  totalRebate: number
  netInvestment: number
  paybackYears: number | null
  roi10yr: number
  netSavings10yr: number
  co2SavedKgPerYear: number
  co2SavedTonsPerYear: number
  treesEquivalent: number
  carsEquivalent: number
  existingAnnualCost: number
  ledAnnualCost: number
}

export function computeRoi(input: RoiInputs): RoiResults {
  const runHoursYear = input.hoursPerDay * input.daysPerYear

  const existingKwh = (input.fixtures * input.existingWatts * runHoursYear) / 1000
  const ledKwh = (input.fixtures * input.ledWatts * runHoursYear) / 1000
  const energySavedKwh = Math.max(existingKwh - ledKwh, 0)

  const existingAnnualCost = existingKwh * input.energyRate
  const ledAnnualCost = ledKwh * input.energyRate
  const annualEnergySavings = existingAnnualCost - ledAnnualCost

  const annualTotalSavings = annualEnergySavings + input.annualMaintenanceSavings

  const grossInvestment = input.fixtures * input.costPerFixture
  const totalRebate = input.fixtures * input.rebatePerFixture
  const netInvestment = Math.max(grossInvestment - totalRebate, 0)

  const paybackYears =
    annualTotalSavings > 0 ? netInvestment / annualTotalSavings : null

  const netSavings10yr = annualTotalSavings * 10 - netInvestment
  const roi10yr = netInvestment > 0 ? (netSavings10yr / netInvestment) * 100 : 0

  const co2SavedKgPerYear = energySavedKwh * KG_CO2_PER_KWH
  const co2SavedTonsPerYear = co2SavedKgPerYear / 1000

  return {
    existingKwh,
    ledKwh,
    energySavedKwh,
    annualEnergySavings,
    annualMaintenanceSavings: input.annualMaintenanceSavings,
    annualTotalSavings,
    grossInvestment,
    totalRebate,
    netInvestment,
    paybackYears,
    roi10yr,
    netSavings10yr,
    co2SavedKgPerYear,
    co2SavedTonsPerYear,
    treesEquivalent: co2SavedKgPerYear / KG_CO2_PER_TREE_YEAR,
    carsEquivalent: co2SavedKgPerYear / KG_CO2_PER_CAR_YEAR,
    existingAnnualCost,
    ledAnnualCost,
  }
}

export type CashflowPoint = {
  year: number
  current: number // cumulative spend keeping existing system
  upgrade: number // cumulative net position after upgrade
}

// Cumulative net cash position across N years. Year 0 = upfront investment.
export function buildCashflow(
  input: RoiInputs,
  results: RoiResults,
  years = 10,
): CashflowPoint[] {
  const points: CashflowPoint[] = []
  for (let year = 0; year <= years; year++) {
    points.push({
      year,
      // cumulative cost of doing nothing (energy bills keep stacking up)
      current: -(results.existingAnnualCost * year),
      // net cash position after upgrading: upfront cost recovered by yearly savings
      upgrade: -results.netInvestment + results.annualTotalSavings * year,
    })
  }
  return points
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyFmtCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const numberFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatCurrency(value: number, cents = false): string {
  if (!Number.isFinite(value)) return '—'
  return cents ? currencyFmtCents.format(value) : currencyFmt.format(value)
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatKwh(value: number): string {
  return `${numberFmt.format(Math.round(value))} kWh`
}

export function formatPayback(years: number | null): string {
  if (years === null || !Number.isFinite(years)) return '—'
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} mo`
  }
  const whole = Math.floor(years)
  const months = Math.round((years - whole) * 12)
  if (months === 0) return `${whole} yr`
  return `${whole} yr ${months} mo`
}
