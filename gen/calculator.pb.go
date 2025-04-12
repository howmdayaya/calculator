package gen

import (
	"context"
	"net/http"
	"github.com/bufbuild/connect-go"
)

type CalculateRequest struct {
	A float64
	B float64
}

type CalculateResponse struct {
	Result float64
	Error  string
}

type CalculatorServiceHandler interface {
	Add(context.Context, *connect.Request[CalculateRequest]) (*connect.Response[CalculateResponse], error)
	Subtract(context.Context, *connect.Request[CalculateRequest]) (*connect.Response[CalculateResponse], error)
	Multiply(context.Context, *connect.Request[CalculateRequest]) (*connect.Response[CalculateResponse], error)
	Divide(context.Context, *connect.Request[CalculateRequest]) (*connect.Response[CalculateResponse], error)
}

func NewCalculatorServiceHandler(svc CalculatorServiceHandler, opts ...connect.HandlerOption) (string, http.Handler) {
	service := "/calculator.CalculatorService/"
	return service, connect.NewUnaryHandler(
		service+"Add",
		svc.Add,
		opts...,
	)
}