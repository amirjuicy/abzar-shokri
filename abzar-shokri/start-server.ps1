$logPath = "C:\Users\INO\Desktop\project\abzar-shokri\abzar-shokri\.freebuff\preview-56f7d222-2c25-4327-b695-e19aba5d7d28.log"
$errPath = $logPath + ".err"
$p = Start-Process -FilePath "node.exe" -ArgumentList "server.js" -WorkingDirectory "C:\Users\INO\Desktop\project\abzar-shokri\abzar-shokri" -RedirectStandardOutput $logPath -RedirectStandardError $errPath -WindowStyle Hidden -PassThru
Write-Output $p.Id
