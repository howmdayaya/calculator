// @generated by protoc-gen-connect-es v1.1.3 with parameter "target=ts"
// @generated from file proto/calculator.proto (package calculator, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { CalculateRequest, CalculateResponse } from "./calculator_pb.js"
import { MethodKind } from "@bufbuild/protobuf"

/**
 * 计算器服务定义
 *
 * @generated from service calculator.CalculatorService
 */
export const CalculatorService = {
  typeName: "calculator.CalculatorService",
  methods: {
    /**
     * 加法操作
     *
     * @generated from rpc calculator.CalculatorService.Add
     */
    add: {
      name: "Add",
      I: CalculateRequest,
      O: CalculateResponse,
      kind: MethodKind.Unary,
    },
    /**
     * 减法操作
     *
     * @generated from rpc calculator.CalculatorService.Subtract
     */
    subtract: {
      name: "Subtract",
      I: CalculateRequest,
      O: CalculateResponse,
      kind: MethodKind.Unary,
    },
    /**
     * 乘法操作
     *
     * @generated from rpc calculator.CalculatorService.Multiply
     */
    multiply: {
      name: "Multiply",
      I: CalculateRequest,
      O: CalculateResponse,
      kind: MethodKind.Unary,
    },
    /**
     * 除法操作
     *
     * @generated from rpc calculator.CalculatorService.Divide
     */
    divide: {
      name: "Divide",
      I: CalculateRequest,
      O: CalculateResponse,
      kind: MethodKind.Unary,
    },
  },
}
