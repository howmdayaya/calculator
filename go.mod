module github.com/example/calculator

go 1.23.0

toolchain go1.24.2

require (
	github.com/bufbuild/connect-go v1.10.0
	golang.org/x/net v0.39.0
)

require (
	golang.org/x/text v0.24.0 // indirect
	google.golang.org/protobuf v1.31.0 // indirect
)

replace (
	github.com/example/calculator/calculatorpb => ./calculatorpb
	github.com/example/calculator/gen => ./gen
)
