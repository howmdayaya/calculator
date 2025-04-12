package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/bufbuild/connect-go"
	calculatorpb "github.com/example/calculator/calculatorpb"
)

func main() {
	if len(os.Args) != 4 {
		fmt.Println("用法: client <操作> <数字1> <数字2>")
		fmt.Println("操作: add, subtract, multiply, divide")
		os.Exit(1)
	}

	operation := os.Args[1]
	a, err := strconv.ParseFloat(os.Args[2], 64)
	if err != nil {
		log.Fatalf("无效的第一个数字: %v", err)
	}

	b, err := strconv.ParseFloat(os.Args[3], 64)
	if err != nil {
		log.Fatalf("无效的第二个数字: %v", err)
	}

	
	// 创建客户端
	client := connect.NewClient[calculatorpb.CalculateRequest, calculatorpb.CalculateResponse](
		http.DefaultClient,
		"http://localhost:8080/calculator.CalculatorService/",
	)

	connect.NewRequest(&calculatorpb.CalculateRequest{
		A: a,
		B: b,
	})

	// 根据操作类型调用相应的方法
	var resp *connect.Response[calculatorpb.CalculateResponse]
	ctx := context.Background()

	switch operation {
	case "add":
		resp, err = client.CallUnary(ctx, connect.NewRequest(&calculatorpb.CalculateRequest{
			A: a,
			B: b,
		}))
	case "subtract":
		resp, err = client.CallUnary(ctx, connect.NewRequest(&calculatorpb.CalculateRequest{
			A: a,
			B: b,
		}))
	case "multiply":
		resp, err = client.CallUnary(ctx, connect.NewRequest(&calculatorpb.CalculateRequest{
			A: a,
			B: b,
		}))
	case "divide":
		resp, err = client.CallUnary(ctx, connect.NewRequest(&calculatorpb.CalculateRequest{
			A: a,
			B: b,
		}))
	default:
		log.Fatalf("未知操作: %s", operation)
	}

	if err != nil {
		log.Fatalf("请求失败: %v", err)
	}

	// 处理响应
	if resp.Msg.Error != "" {
		fmt.Printf("错误: %s\n", resp.Msg.Error)
	} else {
		fmt.Printf("结果: %f\n", resp.Msg.Result)
	}
}
