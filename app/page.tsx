"use client"

import { useState } from "react"

// Define our own interfaces instead of using generated protobuf code
interface CalculateRequest {
  a: number
  b: number
}

interface CalculateResponse {
  result: number
  error?: string
}

export default function Calculator() {
  const [displayValue, setDisplayValue] = useState("0")
  const [firstOperand, setFirstOperand] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  const inputDigit = (digit: string) => {
    setError(null)

    if (waitingForSecondOperand) {
      setDisplayValue(digit)
      setWaitingForSecondOperand(false)
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit)
    }
  }

  const inputDecimal = () => {
    setError(null)

    if (waitingForSecondOperand) {
      setDisplayValue("0.")
      setWaitingForSecondOperand(false)
      return
    }

    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".")
    }
  }

  const clearDisplay = () => {
    setDisplayValue("0")
    setFirstOperand(null)
    setOperation(null)
    setWaitingForSecondOperand(false)
    setError(null)
  }

  // Perform calculation locally when backend is not available
  const calculateLocally = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b
      case "-":
        return a - b
      case "×":
        return a * b
      case "÷":
        if (b === 0) {
          throw new Error("除数不能为零")
        }
        return a / b
      default:
        throw new Error("未知操作")
    }
  }

  const handleOperation = async (nextOperation: string) => {
    setError(null)

    const inputValue = Number.parseFloat(displayValue)

    if (firstOperand === null) {
      setFirstOperand(inputValue)
      setWaitingForSecondOperand(true)
      setOperation(nextOperation)
      return
    }

    if (operation) {
      try {
        setCalculating(true)
        const result = await performCalculation(firstOperand, inputValue, operation)
        setDisplayValue(String(result))
        setFirstOperand(result)
        setWaitingForSecondOperand(true)
        setOperation(nextOperation)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("计算错误")
        }
        setFirstOperand(null)
        setOperation(null)
        setWaitingForSecondOperand(false)
      } finally {
        setCalculating(false)
      }
    }
  }

  const performCalculation = async (
    firstOperand: number,
    secondOperand: number,
    operation: string,
  ): Promise<number> => {
    // If we're already in offline mode, don't try to connect to the backend
    if (isOfflineMode) {
      return calculateLocally(firstOperand, secondOperand, operation)
    }

    try {
      const request: CalculateRequest = {
        a: firstOperand,
        b: secondOperand,
      }

      let endpoint = ""
      switch (operation) {
        case "+":
          endpoint = "/calculator.CalculatorService/Add"
          break
        case "-":
          endpoint = "/calculator.CalculatorService/Subtract"
          break
        case "×":
          endpoint = "/calculator.CalculatorService/Multiply"
          break
        case "÷":
          endpoint = "/calculator.CalculatorService/Divide"
          break
        default:
          throw new Error("未知操作")
      }

      // Set a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      try {
        const response = await fetch(`http://localhost:8080${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const result = data as CalculateResponse

        if (result.error) {
          throw new Error(result.error)
        }

        return result.result
      } catch (fetchError) {
        // If fetch fails, switch to offline mode and use local calculation
        console.log("后端服务不可用，切换到本地计算模式")
        setIsOfflineMode(true)
        return calculateLocally(firstOperand, secondOperand, operation)
      }
    } catch (err) {
      console.error("计算错误:", err)
      if (err instanceof Error) {
        throw err
      }
      throw new Error("计算服务错误")
    }
  }

  const handleEquals = async () => {
    if (firstOperand === null || !operation) {
      return
    }

    try {
      setCalculating(true)
      const secondOperand = Number.parseFloat(displayValue)
      const result = await performCalculation(firstOperand, secondOperand, operation)
      setDisplayValue(String(result))
      setFirstOperand(null)
      setOperation(null)
      setWaitingForSecondOperand(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("计算错误")
      }
      setFirstOperand(null)
      setOperation(null)
      setWaitingForSecondOperand(false)
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-800 text-white">
          <div className="text-right text-3xl font-mono h-16 flex items-center justify-end overflow-hidden">
            {calculating ? (
              <div className="animate-pulse">计算中...</div>
            ) : error ? (
              <div className="text-red-400 text-xl">{error}</div>
            ) : (
              displayValue
            )}
          </div>
          {operation && <div className="text-right text-sm text-gray-400">{`${firstOperand} ${operation}`}</div>}
          {isOfflineMode && <div className="text-yellow-400 text-xs mt-1">本地计算模式（后端不可用）</div>}
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={clearDisplay}
              className="col-span-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              AC
            </button>
            <button
              onClick={() => handleOperation("÷")}
              className="p-4 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
            >
              ÷
            </button>
            <button
              onClick={() => handleOperation("×")}
              className="p-4 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
            >
              ×
            </button>

            <button
              onClick={() => inputDigit("7")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              7
            </button>
            <button
              onClick={() => inputDigit("8")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              8
            </button>
            <button
              onClick={() => inputDigit("9")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              9
            </button>
            <button
              onClick={() => handleOperation("-")}
              className="p-4 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
            >
              -
            </button>

            <button
              onClick={() => inputDigit("4")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              4
            </button>
            <button
              onClick={() => inputDigit("5")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              5
            </button>
            <button
              onClick={() => inputDigit("6")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              6
            </button>
            <button
              onClick={() => handleOperation("+")}
              className="p-4 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
            >
              +
            </button>

            <button
              onClick={() => inputDigit("1")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              1
            </button>
            <button
              onClick={() => inputDigit("2")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              2
            </button>
            <button
              onClick={() => inputDigit("3")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              3
            </button>
            <button
              onClick={handleEquals}
              className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors row-span-2"
            >
              =
            </button>

            <button
              onClick={() => inputDigit("0")}
              className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors col-span-2"
            >
              0
            </button>
            <button onClick={inputDecimal} className="p-4 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
              .
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
