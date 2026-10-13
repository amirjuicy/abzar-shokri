cd C:\Users\INO\Desktop\project\abzar-shokri
Start-Process -FilePath "node" -ArgumentList "server/app.js" -WorkingDirectory "C:\Users\INO\Desktop\project\abzar-shokri" -WindowStyle Hidden
Start-Sleep 3
node test_e2e.js