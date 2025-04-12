

## 运行前端（Next.js）

1. 打开命令行终端，进入解压后的项目目录
2. 安装前端依赖：

```shellscript
cd 项目目录
npm install
# 或者如果你使用 yarn
# yarn install
```


3. 启动前端开发服务器：

```shellscript
npm run dev
# 或者如果你使用 yarn
# yarn dev
```


4. 前端应用将在 `http://localhost:3000` 运行


## 运行后端（Go）

1. 打开另一个命令行终端，进入解压后的项目目录
2. 确保你已安装 Go（如果没有，请从 [golang.org](https://golang.org/dl/) 下载并安装）
3. 安装后端依赖：

```shellscript
cd 项目目录
go mod download
```


4. 启动后端服务器：

```shellscript
go run main.go
```


5. 后端服务将在 `http://localhost:8080` 运行


## 可能遇到的问题及解决方案

### 前端问题

1. **依赖安装失败**：

```shellscript
npm cache clean --force
npm install
```


2. **端口冲突**：如果 3000 端口已被占用，可以使用以下命令指定其他端口：

```shellscript
npm run dev -- -p 3001
```




### 后端问题

1. **Go 模块问题**：如果遇到模块相关错误，尝试：

```shellscript
go mod tidy
```


2. **端口冲突**：如果 8080 端口已被占用，你需要修改 `main.go` 文件中的端口号（搜索 `:8080`），然后重新启动服务器。
3. **Protocol Buffers 生成问题**：如果需要重新生成 Protocol Buffers 代码：

```shellscript
# 安装 buf 工具（如果尚未安装）
# macOS: brew install bufbuild/buf/buf
# 其他系统请参考 buf 官方文档

# 生成代码
buf generate
```




## 使用应用

1. 确保前端和后端都在运行
2. 在浏览器中访问 `http://localhost:3000`
3. 你应该能看到计算器界面并开始使用
4. 如果后端服务不可用，前端会自动切换到本地计算模式，你会在计算器界面上看到相应提示


## 注意事项

- 前端应用默认会尝试连接到 `localhost:8080` 上的后端服务
- 确保你的防火墙或安全软件不会阻止应用的网络连接
- 如果你修改了代码，前端会自动重新加载，但后端需要手动重启


如果你遇到任何其他问题，请查看终端输出的错误信息，这通常会提供有用的调试信息。
