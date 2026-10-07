$content = [System.IO.File]::ReadAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js')
$old = '} else {' + "`n" + '        var r=db.prepare("INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(so,img,imgDesktop,imgMobile,ip,badge,title,text,b1t,b1u,b2t,b2u,st,lu,sb,bi,sti,stx,si,isz,sb1,sb2,cp,active);' + "`n" + '        ids.push(r.lastInsertRowid);' + "`n" + '      }'
$new = '} else {' + "`n" + '        var r=db.prepare("INSERT INTO hero_slides (sort_order,image,image_desktop,image_mobile,image_position,badge,title,text,btn1_text,btn1_url,btn2_text,btn2_url,slide_type,link_url,show_badge,badge_icon,show_title,show_text,show_image,image_size,show_btn1,show_btn2,content_position,is_active,show_mobile) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(so,img,imgDesktop,imgMobile,ip,badge,title,text,b1t,b1u,b2t,b2u,st,lu,sb,bi,sti,stx,si,isz,sb1,sb2,cp,active,showMobile);' + "`n" + '        ids.push(r.lastInsertRowid);' + "`n" + '      }'
if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText('C:\Users\INO\Desktop\project\abzar-shokri\server\app.js', $content)
    Write-Host 'Fixed!'
} else {
    Write-Host 'NOT FOUND'
}