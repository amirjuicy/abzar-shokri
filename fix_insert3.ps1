$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$old = 'INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
$new = 'INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active,show_mobile) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js', $content)
    Write-Host 'Fixed!'
} else {
    Write-Host 'NOT FOUND - checking exact bytes'
    $idx = $content.IndexOf('INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active)')
    if ($idx -ge 0) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content.Substring($idx, 200))
        Write-Host ("Bytes: " + ($bytes -join ' '))
    }
}