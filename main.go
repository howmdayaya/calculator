package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"math"
	"net/http"

	"github.com/example/calculator/gen"
	"github.com/bufbuild/connect-go"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

// CalculatorServer 实现 CalculatorService 接口
type CalculatorServer struct{}

// Add 实现加法操作
func (s *CalculatorServer) Add(
	ctx context.Context,
	req *connect.Request[gen.CalculateRequest],
) (*connect.Response[gen.CalculateResponse], error) {
	log.Printf("收到加法请求: %v + %v", req.Msg.A, req.Msg.B)
	result := req.Msg.A + req.Msg.B
	return connect.NewResponse(&gen.CalculateResponse{
		Result: result,
	}), nil
}

// Subtract 实现减法操作
func (s *CalculatorServer) Subtract(
	ctx context.Context,
	req *connect.Request[gen.CalculateRequest],
) (*connect.Response[gen.CalculateResponse], error) {
	log.Printf("收到减法请求: %v - %v", req.Msg.A, req.Msg.B)
	result := req.Msg.A - req.Msg.B
	return connect.NewResponse(&gen.CalculateResponse{
		Result: result,
	}), nil
}

// Multiply 实现乘法操作
func (s *CalculatorServer) Multiply(
	ctx context.Context,
	req *connect.Request[gen.CalculateRequest],
) (*connect.Response[gen.CalculateResponse], error) {
	log.Printf("收到乘法请求: %v * %v", req.Msg.A, req.Msg.B)
	result := req.Msg.A * req.Msg.B
	return connect.NewResponse(&gen.CalculateResponse{
		Result: result,
	}), nil
}

// Divide 实现除法操作
func (s *CalculatorServer) Divide(
	ctx context.Context,
	req *connect.Request[gen.CalculateRequest],
) (*connect.Response[gen.CalculateResponse], error) {
	log.Printf("收到除法请求: %v / %v", req.Msg.A, req.Msg.B)
	
	if req.Msg.B == 0 {
		return connect.NewResponse(&gen.CalculateResponse{
			Error: "除数不能为零",
		}), nil
	}
	
	result := req.Msg.A / req.Msg.B
	
	// 检查是否为无穷大或 NaN
	if math.IsInf(result, 0) || math.IsNaN(result) {
		return connect.NewResponse(&gen.CalculateResponse{
			Error: "计算结果无效",
		}), errors.New("invalid result")
	}
	
	return connect.NewResponse(&gen.CalculateResponse{
		Result: result,
	}), nil
}

// 直接处理 JSON 请求的处理程序
func handleJSONRequest(w http.ResponseWriter, r *http.Request, handler func(req map[string]float64) (map[string]interface{}, error)) {
	// 设置 CORS 头
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
	
	// 处理预检请求
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	
	// 解析请求体
	var req map[string]float64
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "无效的请求格式", http.StatusBadRequest)
		return
	}
	
	// 调用处理函数
	resp, err := handler(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	calculatorServer := &CalculatorServer{}
	
	// 修改中间件定义方式
	middleware := connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			log.Printf("处理请求: %s", req.Spec().Procedure)
			res, err := next(ctx, req)
			if err != nil {
				log.Printf("请求错误: %v", err)
			}
			return res, err
		}
	})

	// 创建 Connect 服务处理器
	calculatorPath, calculatorHandler := gen.NewCalculatorServiceHandler(
		calculatorServer,
		connect.WithInterceptors(middleware),
	)
	
	// 创建 HTTP 多路复用器
	mux := http.NewServeMux()
	
	// 注册 Connect 处理器
	mux.Handle(calculatorPath, withCORS(calculatorHandler))
	
	// 添加直接处理 JSON 的路由
	mux.HandleFunc("/calculator.CalculatorService/Add", func(w http.ResponseWriter, r *http.Request) {
		handleJSONRequest(w, r, func(req map[string]float64) (map[string]interface{}, error) {
			a, b := req["a"], req["b"]
			log.Printf("收到 JSON 加法请求: %v + %v", a, b)
			return map[string]interface{}{
				"result": a + b,
			}, nil
		})
	})
	
	mux.HandleFunc("/calculator.CalculatorService/Subtract", func(w http.ResponseWriter, r *http.Request) {
		handleJSONRequest(w, r, func(req map[string]float64) (map[string]interface{}, error) {
			a, b := req["a"], req["b"]
			log.Printf("收到 JSON 减法请求: %v - %v", a, b)
			return map[string]interface{}{
				"result": a - b,
			}, nil
		})
	})
	
	mux.HandleFunc("/calculator.CalculatorService/Multiply", func(w http.ResponseWriter, r *http.Request) {
		handleJSONRequest(w, r, func(req map[string]float64) (map[string]interface{}, error) {
			a, b := req["a"], req["b"]
			log.Printf("收到 JSON 乘法请求: %v * %v", a, b)
			return map[string]interface{}{
				"result": a * b,
			}, nil
		})
	})
	
	mux.HandleFunc("/calculator.CalculatorService/Divide", func(w http.ResponseWriter, r *http.Request) {
		handleJSONRequest(w, r, func(req map[string]float64) (map[string]interface{}, error) {
			a, b := req["a"], req["b"]
			log.Printf("收到 JSON 除法请求: %v / %v", a, b)
			
			if b == 0 {
				return map[string]interface{}{
					"error": "除数不能为零",
				}, nil
			}
			
			result := a / b
			
			if math.IsInf(result, 0) || math.IsNaN(result) {
				return map[string]interface{}{
					"error": "计算结果无效",
				}, errors.New("invalid result")
			}
			
			return map[string]interface{}{
				"result": result,
			}, nil
		})
	})
	
	// 使用 h2c 支持 HTTP/2 明文连接
	h2cHandler := h2c.NewHandler(mux, &http2.Server{})
	
	// 启动服务器
	addr := "localhost:8080"
	log.Printf("计算器服务启动在 %s", addr)
	if err := http.ListenAndServe(addr, h2cHandler); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

// CORS 中间件
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 设置 CORS 头
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, Connect-Protocol-Version")
		
		// 处理预检请求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		// 处理实际请求
		next.ServeHTTP(w, r)
	})
}

// 删除以下重复代码
/*
mux.Handle(gen.NewCalculatorServiceHandler(&CalculatorServer{}))
*/
