"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Calculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const clearAll = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const toggleSign = () => {
    const value = Number.parseFloat(display)
    setDisplay(String(-value))
  }

  const inputPercent = () => {
    const value = Number.parseFloat(display)
    setDisplay(String(value / 100))
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      let newValue: number

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue
          break
        case "-":
          newValue = currentValue - inputValue
          break
        case "×":
          newValue = currentValue * inputValue
          break
        case "÷":
          newValue = currentValue / inputValue
          break
        default:
          newValue = inputValue
      }

      setPreviousValue(newValue)
      setDisplay(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const handleEquals = () => {
    if (!previousValue || !operation) return

    performOperation("=")
    setOperation(null)
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gray-100 rounded-t-lg">
          <CardTitle className="text-right text-3xl font-mono p-2 h-16 overflow-hidden">{display}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" className="text-lg font-medium" onClick={clearAll}>
              C
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={toggleSign}>
              +/-
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={inputPercent}>
              %
            </Button>
            <Button
              variant="secondary"
              className="text-lg font-medium text-orange-500"
              onClick={() => performOperation("÷")}
            >
              ÷
            </Button>

            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("7")}>
              7
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("8")}>
              8
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("9")}>
              9
            </Button>
            <Button
              variant="secondary"
              className="text-lg font-medium text-orange-500"
              onClick={() => performOperation("×")}
            >
              ×
            </Button>

            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("4")}>
              4
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("5")}>
              5
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("6")}>
              6
            </Button>
            <Button
              variant="secondary"
              className="text-lg font-medium text-orange-500"
              onClick={() => performOperation("-")}
            >
              -
            </Button>

            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("1")}>
              1
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("2")}>
              2
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={() => inputDigit("3")}>
              3
            </Button>
            <Button
              variant="secondary"
              className="text-lg font-medium text-orange-500"
              onClick={() => performOperation("+")}
            >
              +
            </Button>

            <Button variant="outline" className="text-lg font-medium col-span-2" onClick={() => inputDigit("0")}>
              0
            </Button>
            <Button variant="outline" className="text-lg font-medium" onClick={inputDot}>
              .
            </Button>
            <Button
              variant="primary"
              className="text-lg font-medium bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleEquals}
            >
              =
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
