$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('mg,imgDesktop,imgMobile,ip,badge,title,text,b1t,b1u,b2t,b2u,st,lu,sb,bi,sti,stx,si,isz,sb1,sb2,cp,active)')
if ($idx -ge 0) {
    Write-Host "Found at: $idx"
    # Remove from ');mg...' to the end of that line (until ';')
    $endIdx = $content.IndexOf(';', $idx)
    if ($endIdx -ge 0) {
        $endIdx++ # include the semicolon
        $before = $content.Substring(0, $idx)
        $after = $content.Substring($endIdx)
        $new = $before + $after
        [System.IO.File]::WriteAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js', $new)
        Write-Host "Fixed! Removed garbage from $idx to $endIdx"
    } else {
        Write-Host "No semicolon found after garbage"
    }
} else {
    Write-Host 'NOT FOUND'
}