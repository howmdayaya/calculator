package main

import (
	"log"
	"net/http"

	"github.com/example/calculator/calculator"
	calculatorpb "github.com/example/calculator/calculatorpb"
	"github.com/bufbuild/connect-go"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func main() {
	calculatorServer := &calculator.CalculatorServer{}
	
	// 创建 ConnectRPC 处理器
	mux := http.NewServeMux()
	
	// 注册服务处理器
	path, handler := calculatorpb.NewCalculatorServiceHandler(calculatorServer)
	mux.Handle(path, handler)
	
	// 添加 CORS 中间件
	corsHandler := withCORS(mux)
	
	// 使用 h2c 支持 HTTP/2 明文连接
	h2cHandler := h2c.NewHandler(corsHandler, &http2.Server{})
	
	// 启动服务器
	log.Println("计算器服务启动在 :8080 端口...")
	if err := http.ListenAndServe(":8080", h2cHandler); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

// CORS 中间件
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, Connect-Protocol-Version")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}
