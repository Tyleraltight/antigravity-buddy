$ErrorActionPreference = "Stop"

$ShortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\DesktopBuddy.lnk"
$TargetPath = "E:\ClaudeCode\PROJECTS\Antigravity_bot\src-tauri\target\release\tauri-app.exe"
$WorkingDirectory = "E:\ClaudeCode\PROJECTS\Antigravity_bot\src-tauri\target\release"

write-host "Creating shortcut at $ShortcutPath"
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $WorkingDirectory
$Shortcut.WindowStyle = 1 # Normal
$Shortcut.Save()

write-host "Done. The app is set to launch on system startup."
