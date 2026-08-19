## ขั้นตอนต่อไป: ขึ้น AWS

โฟลเดอร์นี้พร้อมอัปโหลดขึ้น Amazon S3 ได้เลย จุดที่ต้องระวังตอนตั้งค่า:

1. อัปโหลดโดยคงโครงสร้างโฟลเดอร์ไว้ (`Css/`, `Js/`, `Images/` ต้องอยู่ระดับเดียวกับ `index.html`)
2. ตั้ง Index document เป็น `index.html`
3. ปิด public access ที่ bucket แล้วให้ CloudFront เข้าถึงผ่าน **Origin Access Control (OAC)** แทน
4. ตั้ง Viewer protocol policy เป็น *Redirect HTTP to HTTPS*
5. ทุกครั้งที่อัปเดตไฟล์ อย่าลืม **CloudFront Invalidation** (`/*`) ไม่งั้นจะยังเห็นของเก่าจาก cache
