package calculator

import (
	"context"
	"errors"
	"fmt"
	"math"

	calculatorpb "github.com/example/calculator/calculatorpb"
)

// CalculatorServer 实现 CalculatorService 接口
type CalculatorServer struct{}

// Add 实现加法操作
func (s *CalculatorServer) Add(ctx context.Context, req *calculatorpb.CalculateRequest) (*calculatorpb.CalculateResponse, error) {
	result := req.A + req.B
	return &calculatorpb.CalculateResponse{
		Result: result,
	}, nil
}

// Subtract 实现减法操作
func (s *CalculatorServer) Subtract(ctx context.Context, req *calculatorpb.CalculateRequest) (*calculatorpb.CalculateResponse, error) {
	result := req.A - req.B
	return &calculatorpb.CalculateResponse{
		Result: result,
	}, nil
}

// Multiply 实现乘法操作
func (s *CalculatorServer) Multiply(ctx context.Context, req *calculatorpb.CalculateRequest) (*calculatorpb.CalculateResponse, error) {
	result := req.A * req.B
	return &calculatorpb.CalculateResponse{
		Result: result,
	}, nil
}

// Divide 实现除法操作
func (s *CalculatorServer) Divide(ctx context.Context, req *calculatorpb.CalculateRequest) (*calculatorpb.CalculateResponse, error) {
	if req.B == 0 {
		return &calculatorpb.CalculateResponse{
			Error: "除数不能为零",
		}, errors.New("division by zero")
	}
	
	result := req.A / req.B
	
	// 检查是否为无穷大或 NaN
	if math.IsInf(result, 0) || math.IsNaN(result) {
		return &calculatorpb.CalculateResponse{
			Error: "计算结果无效",
		}, fmt.Errorf("invalid result: %v", result)
	}
	
	return &calculatorpb.CalculateResponse{
		Result: result,
	}, nil
}
