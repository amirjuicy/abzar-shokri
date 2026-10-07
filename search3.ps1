$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('hero_slides')
Write-Host "First occurrence at: $idx"
if ($idx -ge 0) { Write-Host $content.Substring($idx, 500) }