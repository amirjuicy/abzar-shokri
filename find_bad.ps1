$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('mg,imgDesktop,imgMobile,ip,badge,title,text,b1t,b1u,b2t,b2u,st,lu,sb,bi,sti,stx,si,isz,sb1,sb2,cp,active)')
if ($idx -ge 0) {
    Write-Host "Found at: $idx"
    Write-Host $content.Substring($idx - 50, 150)
}