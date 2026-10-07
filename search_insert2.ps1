$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('INSERT INTO hero_slides')
if ($idx -ge 0) { Write-Host $content.Substring($idx, 300) } else { Write-Host 'NOT FOUND' }