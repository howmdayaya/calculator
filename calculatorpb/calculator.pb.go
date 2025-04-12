package calculatorpb

// CalculateRequest 计算请求
type CalculateRequest struct {
	A float64
	B float64
}

// CalculateResponse 计算响应
type CalculateResponse struct {
	Result float64
	Error  string
}