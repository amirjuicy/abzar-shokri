$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$idx = $content.IndexOf('INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active)')
if ($idx -ge 0) {
    Write-Host "Found at: $idx"
    Write-Host $content.Substring($idx, 300)
} else {
    Write-Host 'NOT FOUND - trying partial'
    $idx2 = $content.IndexOf('INSERT INTO hero_slides (sort_order')
    if ($idx2 -ge 0) {
        Write-Host $content.Substring($idx2, 300)
    } else {
        Write-Host 'Still not found'
    }
}