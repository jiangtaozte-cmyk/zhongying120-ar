// 生成钟英中学百廿校庆 AR 的 6 张"校史纪念卡"SVG→PNG（含角落同一二维码）。
// 用法： node build-cards.js
// 部署 URL 改动：设环境变量 AR_URL=<你的页面URL> 后重跑，再重编 targets.mind。
"use strict";
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { Resvg } = require("@resvg/resvg-js");

const ROOT = path.resolve(__dirname, "..");
const SVG_DIR = path.join(ROOT, "cards-svg");
const PNG_DIR = path.join(ROOT, "assets", "cards");
fs.mkdirSync(SVG_DIR, { recursive: true });
fs.mkdirSync(PNG_DIR, { recursive: true });

// 二维码编码的页面 URL —— 部署后请用环境变量覆盖并重跑：
//   set AR_URL=https://你的域名/zhongying120-ar/   (Windows)
//   AR_URL=https://... node build-cards.js          (bash)
const DEPLOY_URL = process.env.AR_URL || "https://jiangtaozte-cmyk.github.io/zhongying120-ar/";

const W = 1200, H = 1680; // 卡面画布（纵向 5:7，与 AR 相框比例接近）
const C = {
  red: "#8b1a1a", darkRed: "#2c1810", cream: "#f5e6c8", gold: "#f5c542",
  green: "#2c5f3f", ink: "#2c1810", goldDk: "#e8a317", gray: "#6b5b4a", paper: "#f5e6c8",
};

// ---- 6 张卡的定义 ----
const cards = [
  { id: "chengzhi", idx: 1, title: "创校承志", eraBig: "1904", eraSub: "创办·更名", illu: illuChengzhi },
  { id: "xiqian",   idx: 2, title: "抗战西迁", eraBig: "1937—1945", eraSub: "西迁·弦歌", illu: illuXiqian },
  { id: "zenggongci",idx: 3, title: "曾公祠定址", eraBig: "1954", eraSub: "定址·古祠", illu: illuZenggongci },
  { id: "fuming",   idx: 4, title: "恢复钟英", eraBig: "2014", eraSub: "复名·薪传", illu: illuFuming },
  { id: "xiaoyou",  idx: 5, title: "杰出校友", eraBig: "钟阜毓秀", eraSub: "群星·璀璨", illu: illuXiaoyou },
  { id: "xiaoxun",  idx: 6, title: "校训文化", eraBig: "勤朴诚毅", eraSub: "立身·传承", illu: illuXiaoxun },
];

function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// ---- 共享卡面外壳（边框/页眉/年代/校训条/二维码/编号）----
function shell(d, qrDataUrl){
  const diamonds = [[66,66],[1134,66],[66,1614],[1134,1614]]
    .map(([x,y]) => `<rect x="${x-12}" y="${y-12}" width="24" height="24" transform="rotate(45 ${x} ${y})" fill="${C.gold}" stroke="${C.red}" stroke-width="2"/>`).join("");
  const motto = ["勤","朴","诚","毅"]
    .map((ch,i)=>`<text x="${420+i*120}" y="1305" font-family="SimHei" font-size="40" fill="${C.green}" text-anchor="middle">${ch}</text>`).join("")
    + `<line x1="320" y1="1285" x2="880" y2="1285" stroke="${C.goldDk}" stroke-width="2"/><line x1="320" y1="1325" x2="880" y2="1325" stroke="${C.goldDk}" stroke-width="2"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${C.cream}"/>
  <!-- 边框 -->
  <rect x="40" y="40" width="1120" height="1600" fill="none" stroke="${C.red}" stroke-width="18"/>
  <rect x="66" y="66" width="1068" height="1548" fill="none" stroke="${C.gold}" stroke-width="5"/>
  ${diamonds}
  <!-- 页眉 -->
  <text x="600" y="150" font-family="SimHei" font-size="46" font-weight="bold" fill="${C.red}" text-anchor="middle">南京市钟英中学</text>
  <text x="600" y="196" font-family="SimHei" font-size="30" fill="${C.green}" text-anchor="middle">百廿校庆 · 1904 — 2024</text>
  <line x1="240" y1="222" x2="960" y2="222" stroke="${C.gold}" stroke-width="2"/>
  <!-- 标题 / 大年代 -->
  <text x="600" y="300" font-family="SimHei" font-size="72" font-weight="bold" fill="${C.red}" text-anchor="middle">${esc(d.title)}</text>
  <text x="600" y="402" font-family="SimHei" font-size="78" font-weight="bold" fill="${C.goldDk}" stroke="${C.red}" stroke-width="1.5" text-anchor="middle">${esc(d.eraBig)}</text>
  <text x="600" y="446" font-family="SimHei" font-size="26" fill="${C.green}" text-anchor="middle">${esc(d.eraSub)}</text>
  <!-- 中心插画（470..1240）-->
  ${d.illu()}
  <!-- 校训条 -->
  ${motto}
  <!-- 底部分隔与编号 -->
  <line x1="120" y1="1350" x2="1080" y2="1350" stroke="${C.gold}" stroke-width="1"/>
  <text x="120" y="1400" font-family="SimHei" font-size="22" fill="${C.red}" font-weight="bold">钟英校史纪念卡</text>
  <text x="120" y="1430" font-family="SimHei" font-size="18" fill="${C.green}">No. ${String(d.idx).padStart(2,"0")} / 06 · ${esc(d.title)}</text>
  <!-- 二维码（同一 URL）-->
  <text x="1010" y="1395" font-family="SimHei" font-size="20" fill="${C.red}" text-anchor="middle">扫码体验 AR</text>
  <rect x="905" y="1410" width="210" height="210" fill="${C.cream}" stroke="${C.red}" stroke-width="3"/>
  <image href="${qrDataUrl}" x="912" y="1417" width="196" height="196"/>
</svg>`;
}

// ---- 各卡中心插画 ----
function illuChengzhi(){ // 老校门
  const step = (y,w,off)=>`<rect x="${600-w/2}" y="${y}" width="${w}" height="14" fill="${C.gray}"/>`;
  return `<g>
    <line x1="200" y1="1230" x2="1000" y2="1230" stroke="${C.gray}" stroke-width="3"/>
    ${step(1196,560,0)}${step(1180,460,0)}${step(1164,360,0)}
    <!-- 旗杆与旗帜 -->
    <line x1="270" y1="700" x2="270" y2="1180" stroke="${C.ink}" stroke-width="5"/>
    <rect x="276" y="700" width="86" height="58" fill="${C.red}"/>
    <!-- 校门屋顶 -->
    <polygon points="360,720 840,720 800,640 400,640" fill="${C.darkRed}" stroke="${C.gold}" stroke-width="4"/>
    <polygon points="345,728 375,720 825,720 855,728 815,650 385,650" fill="${C.darkRed}" stroke="${C.gold}" stroke-width="3" opacity="0.6"/>
    <rect x="556" y="600" width="88" height="44" fill="${C.gold}" stroke="${C.red}" stroke-width="2"/>
    <circle cx="600" cy="622" r="10" fill="${C.red}"/>
    <!-- 立柱 -->
    <rect x="470" y="720" width="56" height="470" fill="${C.red}" stroke="${C.darkRed}" stroke-width="2"/>
    <rect x="674" y="720" width="56" height="470" fill="${C.red}" stroke="${C.darkRed}" stroke-width="2"/>
    <rect x="460" y="710" width="76" height="20" fill="${C.gold}"/>
    <rect x="664" y="710" width="76" height="20" fill="${C.gold}"/>
    <!-- 匾额 -->
    <rect x="514" y="860" width="172" height="92" fill="${C.cream}" stroke="${C.red}" stroke-width="4"/>
    <text x="600" y="922" font-family="SimHei" font-size="52" font-weight="bold" fill="${C.red}" text-anchor="middle">承志</text>
    <!-- 门 -->
    <rect x="548" y="970" width="52" height="220" fill="${C.darkRed}"/>
    <rect x="600" y="970" width="52" height="220" fill="${C.darkRed}"/>
    <circle cx="590" cy="1080" r="6" fill="${C.gold}"/><circle cx="610" cy="1080" r="6" fill="${C.gold}"/>
  </g>`;
}
function illuXiqian(){ // 西迁路线图
  const pts = [[300,1100],[420,980],[540,860],[660,740],[780,620],[880,520]]; // 南京→西
  const dot = (x,y,t)=>`<circle cx="${x}" cy="${y}" r="9" fill="${C.red}" stroke="${C.gold}" stroke-width="2"/><text x="${x}" y="${y-20}" font-family="SimHei" font-size="26" fill="${C.darkRed}" text-anchor="middle">${t}</text>`;
  const line = pts.map((p,i)=> (i? "L":"M")+p[0]+" "+p[1]).join(" ");
  return `<g>
    <rect x="140" y="490" width="920" height="720" fill="${C.cream}" stroke="${C.goldDk}" stroke-width="2"/>
    <text x="180" y="540" font-family="SimHei" font-size="28" fill="${C.green}">西迁办学路线</text>
    <path d="${line}" fill="none" stroke="${C.goldDk}" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/>
    ${dot(pts[0][0],pts[0][1],"南京")}
    ${dot(pts[2][0],pts[2][1],"武汉")}
    ${dot(pts[4][0],pts[4][1],"长沙")}
    ${dot(pts[5][0],pts[5][1],"贵阳")}
    <!-- 罗盘 -->
    <g transform="translate(960,1130)">
      <circle cx="0" cy="0" r="56" fill="${C.cream}" stroke="${C.red}" stroke-width="3"/>
      <polygon points="0,-48 12,0 0,48 -12,0" fill="${C.red}"/>
      <polygon points="-48,0 0,12 48,0 0,-12" fill="${C.green}"/>
      <text x="0" y="-60" font-family="SimHei" font-size="22" fill="${C.red}" text-anchor="middle">北</text>
    </g>
    <!-- 行进小人剪影 -->
    <g fill="${C.darkRed}">
      <circle cx="430" cy="975" r="14"/><rect x="418" y="990" width="24" height="40"/>
      <circle cx="560" cy="845" r="14"/><rect x="548" y="860" width="24" height="40"/>
    </g>
  </g>`;
}
function illuZenggongci(){ // 曾公祠
  return `<g>
    <!-- 飞檐屋顶 -->
    <path d="M300 760 Q300 700 360 690 L840 690 Q900 700 900 760 L820 760 L760 700 L440 700 L380 760 Z" fill="${C.green}" stroke="${C.gold}" stroke-width="3"/>
    <path d="M280 762 Q300 700 360 690 L840 690 Q900 700 920 762" fill="none" stroke="${C.gold}" stroke-width="4"/>
    <rect x="560" y="648" width="80" height="44" fill="${C.gold}" stroke="${C.red}" stroke-width="2"/>
    <!-- 立柱 -->
    ${[400,520,680,800].map(x=>`<rect x="${x}" y="760" width="40" height="420" fill="${C.red}" stroke="${C.darkRed}" stroke-width="2"/>`).join("")}
    ${[400,520,680,800].map(x=>`<rect x="${x-8}" y="752" width="56" height="16" fill="${C.gold}"/>`).join("")}
    <!-- 匾额 -->
    <rect x="500" y="830" width="200" height="80" fill="${C.cream}" stroke="${C.red}" stroke-width="4"/>
    <text x="600" y="884" font-family="SimHei" font-size="44" font-weight="bold" fill="${C.red}" text-anchor="middle">曾公祠</text>
    <!-- 门扇 -->
    <rect x="440" y="930" width="320" height="250" fill="${C.darkRed}" stroke="${C.gold}" stroke-width="2"/>
    <line x1="600" y1="930" x2="600" y2="1180" stroke="${C.gold}" stroke-width="3"/>
    <circle cx="580" cy="1060" r="7" fill="${C.gold}"/><circle cx="620" cy="1060" r="7" fill="${C.gold}"/>
    <!-- 台基 -->
    <rect x="360" y="1180" width="480" height="18" fill="${C.gray}"/>
    <rect x="320" y="1198" width="560" height="18" fill="${C.gray}"/>
  </g>`;
}
function illuFuming(){ // 校名牌揭幕
  return `<g>
    <!-- 帷幕 -->
    <path d="M200 500 L200 1240 L360 1180 L360 520 Z" fill="${C.red}" opacity="0.92" stroke="${C.gold}" stroke-width="2"/>
    <path d="M1000 520 L1000 1180 L1160 1240 L1160 500 Z" fill="${C.red}" opacity="0.92" stroke="${C.gold}" stroke-width="2"/>
    <circle cx="360" cy="520" r="14" fill="${C.gold}"/><circle cx="840" cy="520" r="14" fill="${C.gold}"/>
    <!-- 牌匾 -->
    <rect x="300" y="620" width="600" height="380" rx="14" fill="${C.red}" stroke="${C.gold}" stroke-width="10"/>
    <rect x="330" y="650" width="540" height="320" fill="none" stroke="${C.goldDk}" stroke-width="2"/>
    <text x="600" y="880" font-family="SimHei" font-size="200" font-weight="bold" fill="${C.gold}" text-anchor="middle">钟英</text>
    <!-- 飘带 -->
    <path d="M300 1010 Q420 1080 360 1180" fill="none" stroke="${C.gold}" stroke-width="6"/>
    <path d="M900 1010 Q780 1080 840 1180" fill="none" stroke="${C.gold}" stroke-width="6"/>
    <!-- 钉 -->
    <circle cx="340" cy="660" r="10" fill="${C.gold}"/><circle cx="860" cy="660" r="10" fill="${C.gold}"/>
  </g>`;
}
function illuXiaoyou(){ // 校友群像
  const people = [
    {n:"任新民",d:"两弹一星"},{n:"吴良镛",d:"两院院士"},{n:"刘西尧",d:"前教育部长"},
    {n:"刘宇一",d:"画家"},{n:"叶兆言",d:"作家"},{n:"游本昌",d:"演员"},
  ];
  const cell = (p,i)=>{
    const cx = 240, cols = 3, r = i % cols, row = Math.floor(i/cols);
    const x = 200 + r*300, y = 540 + row*350;
    return `<g>
      <rect x="${x}" y="${y}" width="240" height="280" rx="10" fill="${C.cream}" stroke="${C.red}" stroke-width="4"/>
      <circle cx="${x+120}" cy="${y+100}" r="56" fill="${C.darkRed}"/>
      <path d="M${x+40} ${y+250} Q${x+120} ${y+150} ${x+200} ${y+250} Z" fill="${C.darkRed}"/>
      <text x="${x+120}" y="${y+310}" font-family="SimHei" font-size="30" font-weight="bold" fill="${C.red}" text-anchor="middle">${p.n}</text>
      <text x="${x+120}" y="${y+340}" font-family="SimHei" font-size="20" fill="${C.green}" text-anchor="middle">${p.d}</text>
    </g>`;
  };
  return `<g>${people.map(cell).join("")}</g>`;
}
function illuXiaoxun(){ // 校训四字
  const chars = [["勤","勤以治事"],["朴","朴以修身"],["诚","诚以待人"],["毅","毅以立志"]];
  const cell = (p,i)=>{
    const r = i % 2, row = Math.floor(i/2);
    const x = 240 + r*380, y = 540 + row*360;
    return `<g>
      <rect x="${x}" y="${y}" width="340" height="300" rx="8" fill="${C.red}" stroke="${C.gold}" stroke-width="8"/>
      <rect x="${x+16}" y="${y+16}" width="308" height="268" fill="none" stroke="${C.goldDk}" stroke-width="2"/>
      <text x="${x+170}" y="${y+200}" font-family="SimHei" font-size="150" font-weight="bold" fill="${C.gold}" text-anchor="middle">${p[0]}</text>
      <text x="${x+170}" y="${y+258}" font-family="SimHei" font-size="30" fill="${C.cream}" text-anchor="middle">${p[1]}</text>
    </g>`;
  };
  return `<g>${chars.map(cell).join("")}</g>`;
}

async function main(){
  // 生成同一二维码（PNG data URI，墨色on米黄）
  const qrDataUrl = await QRCode.toDataURL(DEPLOY_URL, {
    margin: 1, width: 420, errorCorrectionLevel: "M",
    color: { dark: C.ink, light: C.cream }
  });
  console.log("二维码编码 URL:", DEPLOY_URL);

  const fontOpts = { loadSystemFonts: true, fontDirs: ["C:/Windows/Fonts"], defaultFontFamily: "SimHei",
    fontFiles: ["C:/Windows/Fonts/simhei.ttf", "C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/msyhbd.ttc"] };

  for (const d of cards){
    const svg = shell(d, qrDataUrl);
    fs.writeFileSync(path.join(SVG_DIR, d.id + ".svg"), svg, "utf8");
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, font: fontOpts });
    const png = resvg.render().asPng();
    fs.writeFileSync(path.join(PNG_DIR, d.id + ".png"), png);
    console.log(`  ✓ ${d.id}.png  (${png.length} bytes)`);
  }
  // 顺便导出独立二维码（备用）
  const qrPng = Buffer.from(qrDataUrl.split(",")[1], "base64");
  fs.writeFileSync(path.join(PNG_DIR, "qr-only.png"), qrPng);
  console.log("  ✓ qr-only.png");
  console.log("完成。如部署 URL 变更，请重跑后重编 targets.mind。");
}
main().catch(e=>{ console.error(e); process.exit(1); });
