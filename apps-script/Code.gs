/**
 * NGD Academy — Apps Script starter
 * اربط هذا المشروع بـ Google Sheet ثم شغّل setupNGDSheets() مرة واحدة.
 * لا تنشر بيانات الطلاب أو المتطوعين من endpoint عام.
 */
function setupNGDSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = {
    Courses: ["course_id","title","category","description","status","registration_url","start_date","image_url"],
    Announcements: ["announcement_id","title","body","published","publish_date"],
    Events: ["event_id","title","description","event_date","location","registration_url","published"]
  };
  Object.entries(tabs).forEach(([name, headers]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1,1,1,headers.length).setValues([headers]);
      sh.getRange(1,1,1,headers.length).setBackground("#092342").setFontColor("#F9F7F1").setFontWeight("bold");
      sh.setFrozenRows(1);
    }
  });
}
function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || "health";
  if (type === "health") return output({ok:true,service:"NGD Academy"});
  const allowed = {courses:"Courses", announcements:"Announcements", events:"Events"};
  if (!allowed[type]) return output({ok:false,error:"Unsupported type"});
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(allowed[type]);
  if (!sh || sh.getLastRow()<2) return output({ok:true,data:[]});
  const rows = sh.getDataRange().getDisplayValues();
  const headers = rows.shift();
  const data = rows.filter(r=>r.some(v=>v!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
  const visible = data.filter(row => ["true","yes","published","open","active","منشور","متاح"].includes(String(row.published || row.status || "").trim().toLowerCase()));
  return output({ok:true,data:visible});
}
function output(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
