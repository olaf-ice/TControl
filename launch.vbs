Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strPath = "c:\Users\vades\OneDrive\Documents\TControl\"
WshShell.CurrentDirectory = strPath

' 1. Start Node.js Web Server silently (0 = SW_HIDE, completely invisible)
WshShell.Run "cmd /c node server.js", 0, False

' 2. Start Python AI Microservice silently (0 = SW_HIDE, completely invisible)
userProfile = WshShell.ExpandEnvironmentStrings("%USERPROFILE%")
uvPath = userProfile & "\.local\bin\uv.exe"

If fso.FileExists(uvPath) Then
    WshShell.Run "cmd /c cd /d " & Chr(34) & strPath & "ai-service" & Chr(34) & " && " & Chr(34) & uvPath & Chr(34) & " run python main.py", 0, False
Else
    WshShell.Run "cmd /c cd /d " & Chr(34) & strPath & "ai-service" & Chr(34) & " && python main.py", 0, False
End If

' 3. Give services 1.5 seconds to bind ports
WScript.Sleep 1500

' 4. Launch TControl in clean Desktop App Window (1 = SW_SHOWNORMAL)
edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")

If fso.FileExists(edgePath) Then
    WshShell.Run Chr(34) & edgePath & Chr(34) & " --app=http://localhost:3000 --window-size=1600,920", 1, False
ElseIf fso.FileExists(chromePath) Then
    WshShell.Run Chr(34) & chromePath & Chr(34) & " --app=http://localhost:3000 --window-size=1600,920", 1, False
Else
    WshShell.Run "http://localhost:3000", 1, False
End If
