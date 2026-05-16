"use client"

import { useState } from "react"

interface MortgageCalculatorProps {
  price: number
  currency?: string
}

export function MortgageCalculator({ price, currency = "$" }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(20)
  const [rate, setRate] = useState(6.5)
  const [years, setYears] = useState(30)

  const loanAmount = price * (1 - downPayment / 100)
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12
  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / numPayments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)

  const formatPrice = (v: number) =>
    `${currency}${Math.round(v).toLocaleString()}`

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h4 className="font-semibold text-white text-sm">Mortgage Calculator</h4>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Down Payment: {downPayment}%</span>
            <span>{formatPrice(price * (downPayment / 100))}</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Interest Rate</span>
            <span>{rate}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Loan Term</span>
            <span>{years} years</span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-neutral-400 mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(monthlyPayment)}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {formatPrice(loanAmount)} loan at {rate}% over {years} years
          </p>
        </div>
      </div>
    </div>
  )
}
