param(
    [Parameter(Mandatory=$true)]
    [string]$state
)

$processName = "tauri-app"
$exePath = "E:\ClaudeCode\PROJECTS\Antigravity_bot\src-tauri\target\release\tauri-app.exe"
$url = "http://127.0.0.1:3003/state/$state"

# 检查 Buddy 是否正在运行
$isRunning = Get-Process -Name $processName -ErrorAction SilentlyContinue

if (-not $isRunning) {
    # 如果没运行而且是刚开启 Antigravity (比如发出了 thinking 请求)
    if (Test-Path $exePath) {
        Start-Process $exePath
        # 稍微等一小会儿让后端服务绑定端口
        Start-Sleep -Milliseconds 800
    }
}

# 发送状态请求并静默忽略任何错误
Invoke-RestMethod -Uri $url -Method Get -ErrorAction SilentlyContinue | Out-Null
