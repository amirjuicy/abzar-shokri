$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
if ($idx -ge 0) {
    Write-Host "Found at: $idx"
    $before = $content.Substring(0, $idx)
    $after = $content.Substring($idx + 65)
    $new = $before + 'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(so,img,imgDesktop,imgMobile,ip,badge,title,text,b1t,b1u,b2t,b2u,st,lu,sb,bi,sti,stx,si,isz,sb1,sb2,cp,active,showMobile);' + $after
    [System.IO.File]::WriteAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js', $new)
    Write-Host 'Fixed!'
} else {
    Write-Host 'NOT FOUND'
}