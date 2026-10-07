$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$matches = [regex]::Matches($content, 'INSERT INTO hero_slides \(sort_order.*?\)')
foreach ($m in $matches) { Write-Host $m.Value.Substring(0, 250); Write-Host '---' }