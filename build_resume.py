#!/usr/bin/env python3
"""
Builds resume.pdf (2 pages, A4) and resume-preview.jpg from the HTML template below.

Requirements:  pip install playwright pypdfium2 pillow  &&  playwright install chromium
Files needed in the same folder:  photo.jpg  (3:4 portrait, e.g. 600x800)
Run:  python3 build_resume.py
"""
import base64
import datetime
from pathlib import Path

HERE = Path(__file__).parent

# ------------------------------------------------------------------ CONFIG
TODAY = datetime.date.today()
DATE_TEXT = f"{TODAY.year}年{TODAY.month}月{TODAY.day}日現在"
BIRTH = datetime.date(1998, 4, 15)
AGE = TODAY.year - BIRTH.year - ((TODAY.month, TODAY.day) < (BIRTH.month, BIRTH.day))
BIRTH_TEXT = f"{BIRTH.year}年{BIRTH.month}月{BIRTH.day}日生"
EMAIL = "luca.helgert@icloud.com"
PORTFOLIO = "lucanicohe.github.io"        # your portfolio site (please confirm this is the exact URL)

# Certification dates are not in your files, so they are left empty.
# Fill in (year, month) as strings, e.g. ("2026", "2")
DATE_AI900 = ("2026", "2")
DATE_JHMA = ("2026", "4")
# ------------------------------------------------------------------------

photo_b64 = base64.b64encode((HERE / "photo.jpg").read_bytes()).decode()


def rows(items, blanks=0):
    out = []
    for y, m, text in items:
        out.append(f'<tr><td class="c">{y}</td><td class="c">{m}</td><td>{text}</td></tr>')
    for _ in range(blanks):
        out.append('<tr><td></td><td></td><td></td></tr>')
    return "\n".join(out)


education = [
    ("2004", "4", "ドイツ連邦共和国　小学校（Grundschule）入学　※4年制"),
    ("2008", "3", "同　卒業"),
    ("2008", "4", "ドイツ連邦共和国　ハンス実科学校（Realschule）入学　※中学校相当・6年制"),
    ("2014", "3", "同　卒業"),
    ("2014", "4", "グスタフ・フォン・シュレール学校（Gustav-von-Schlör-Schule）入学　※高等学校相当"),
    ("2017", "3", "同　卒業（アビトゥーア／大学入学資格 取得）"),
    ("2017", "4", "OTHレーゲンスブルク（Ostbayerische Technische Hochschule Regensburg）入学"),
    ("2023", "", "来日"),
    ("2023", "4", "Kai日本語スクール（Kai Language School）入学"),
    ("2025", "3", "同　修了（日本語能力 N2レベル）"),
    ("2025", "4", "東京デザインテクノロジーセンター専門学校（TECH.C.）　ゲームプログラミング専攻　入学"),
    ("2028", "3", "同　卒業見込"),
]



html = f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>履歴書 — Luca Helgert</title>
<style>
@page {{ size: 210mm 297mm; margin: 0 }}
* {{ box-sizing: border-box }}
html, body {{ margin: 0; padding: 0 }}
body {{ font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "ヒラギノ角ゴシック", "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", "Noto Sans JP", sans-serif; color: #000; font-size: 9pt; -webkit-print-color-adjust: exact }}
.page {{ width: 210mm; height: 297mm; padding: 12mm 14mm 10mm; page-break-after: always; position: relative; overflow: hidden }}
.page:last-child {{ page-break-after: auto }}

table {{ border-collapse: collapse; width: 100% }}
td, th {{ border: .3mm solid #000; padding: 0 2mm; vertical-align: middle; font-weight: 400; text-align: left }}
th {{ text-align: center; font-size: 8.5pt }}
.c {{ text-align: center }}
.thick {{ border: .75mm solid #000 }}
.label {{ font-size: 7.5pt; text-align: center; padding: 0 1mm; width: 24mm }}

/* PAGE 1 */
.titlebar {{ display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2mm }}
.titlebar h1 {{ margin: 0; font-size: 23pt; font-weight: 500; letter-spacing: .5em }}
.titlebar .date {{ font-size: 9.5pt; padding-right: 36mm }}
.top {{ display: flex; gap: 0; align-items: stretch }}
.top .left {{ flex: 1; min-width: 0 }}
.photo {{ width: 30mm; height: 40mm; margin-left: 4mm; flex-shrink: 0; border: .3mm solid #000 }}
.photo img {{ width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block }}
.id td {{ height: 6.6mm }}
.id tr.name td {{ height: 16.5mm }}
.id tr.row td {{ height: 8.6mm }}
.id .v {{ font-size: 11pt }}
.id .v2 {{ font-size: 9.5pt; margin-left: 5mm; color: #222 }}
.id tr.age td {{ height: 11.5mm }}
.name-main {{ font-size: 23pt; letter-spacing: .02em; line-height: 1; }}
.name-sub {{ font-size: 9pt; text-align: right; color: #222 }}
.furi {{ font-size: 9.5pt; letter-spacing: .25em }}
.contact {{ margin-top: -.3mm }}
.contact td {{ height: 11mm; font-size: 10pt }}
.contact td.small {{ font-size: 8.5pt }}
.contact td.label {{ font-size: 7.5pt; height: auto }}
.contact td.label.m {{ font-size: 9pt }}
.visa {{ margin-top: 3mm }}
.visa td {{ height: 9mm }}
.visa td.label {{ width: 24mm; font-size: 9pt }}
.visa td.vv {{ font-size: 11pt }}
.visa td.small {{ font-size: 8.8pt }}
.hist {{ margin-top: 4mm }}
.hist td {{ height: 8.2mm; font-size: 9.5pt }}
.hist td:nth-child(1) {{ width: 18mm; text-align: center }}
.hist td:nth-child(2) {{ width: 11mm; text-align: center }}
.hist th {{ height: 8.2mm }}
.end {{ text-align: right !important }}
.foot {{ position: absolute; left: 14mm; right: 14mm; bottom: 7mm; font-size: 7pt; color: #444; display: flex; justify-content: space-between }}

/* PAGE 2 */
.p2 table {{ margin-bottom: 3.2mm }}
.p2head {{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3mm; padding-bottom:1.2mm; border-bottom:.5mm solid #000 }}
.p2head .t {{ font-size:13pt; font-weight:500; letter-spacing:.45em }}
.p2head .n {{ font-size:9pt }}
.p2 .lic td {{ height: 6.6mm; font-size: 8.8pt }}
.p2 .lic th {{ height: 6.4mm }}
.p2 .lic td:nth-child(1) {{ width: 18mm; text-align: center }}
.p2 .lic td:nth-child(2) {{ width: 11mm; text-align: center }}
.skills th {{ height: 6.4mm }}
.skills td {{ vertical-align: top; padding: 1.8mm 3mm 2mm; font-size: 8.3pt; line-height: 1.62 }}
.skills td:first-child {{ width: 64% }}
.skills .g {{ display: flex }}
.skills .k {{ flex: 0 0 19mm; color: #444; font-size: 7.4pt }}
.skills .kk {{ flex: 0 0 10mm }}
.pr th {{ height: 6.4mm }}
.pr td {{ vertical-align: top; padding: 2mm 3.2mm 2.2mm; font-size: 8.6pt; line-height: 1.6 }}
.pr p + p {{ margin-top: .8mm }}
.pr h4 {{ margin: 0 0 .4mm; font-size: 9.8pt; font-weight: 700; line-height: 1.35 }}
.pr h4 .n {{ color:#000 }}
.pr h3 {{ margin: 0 0 1mm; font-size: 8.6pt; font-weight: 700; border-bottom: .2mm solid #000; padding-bottom: .4mm }}
.pr h4:not(:first-child) {{ margin-top: 2.2mm }}
.pr p {{ margin: 0 }}
.pr ul {{ margin: 0; padding: 0; list-style: none }}
.pr li {{ padding-left: 3.2mm; text-indent: -3.2mm }}
.pr .links {{ margin-top: 1.5mm; font-size: 7.6pt }}
.wish th {{ height: 6mm; font-size: 8pt }}
.wish td {{ height: 16mm; vertical-align: top; padding: 2mm 3.2mm; font-size: 8.5pt; line-height: 1.6 }}
</style></head>
<body>

<!-- ================= PAGE 1 ================= -->
<div class="page">
  <div class="titlebar"><h1>履歴書</h1><span class="date">{DATE_TEXT}</span></div>

  <div class="top">
    <div class="left">
      <table class="id thick">
        <tr><td class="label">ふりがな</td><td class="furi">へるげると・るか</td></tr>
        <tr class="name"><td class="label" style="font-size:9pt">氏　名</td>
          <td style="position:relative"><span class="name-main">ヘルゲルト・ルカ</span>
            <span style="position:absolute;right:2.5mm;top:2mm" class="name-sub">HELGERT Luca</span></td></tr>
        <tr class="row"><td class="label">生年月日</td>
          <td><span class="v">{BIRTH_TEXT}</span><span class="v2">（満{AGE}歳）</span></td></tr>
        <tr class="row"><td class="label">国籍</td>
          <td><span class="v">ドイツ</span></td></tr>
      </table>
    </div>
    <div class="photo"><img src="data:image/jpeg;base64,{photo_b64}" alt=""></div>
  </div>

  <table class="contact thick" style="margin-top:3mm">
    <tr><td class="label">ふりがな</td><td class="furi" style="font-size:9pt;height:7mm">とうきょうと　せたがやく　まつばら</td></tr>
    <tr><td class="label m">現住所</td><td style="font-size:11pt">東京都世田谷区松原 <span style="font-size:8pt;color:#333;margin-left:3mm">※番地以下は選考時にお伝えいたします</span></td></tr>
    <tr><td class="label">e-mail</td><td>{EMAIL}</td></tr>
    <tr><td class="label m">電話</td><td class="small">メールにてご連絡をお願いいたします（電話番号は選考時にお伝えいたします）</td></tr>
  </table>

  <table class="visa thick">
    <tr><td class="label m">在留期限</td><td class="vv">2028年5月27日</td></tr>
    <tr><td class="label m">備考</td><td class="small">卒業後の就労に必要な在留資格への変更は、内定後に手続きいたします。</td></tr>
  </table>

  <table class="hist thick">
    <tr><th>年</th><th>月</th><th>学歴</th></tr>
    {rows(education, 2)}
    <tr><td></td><td></td><td class="end">以上</td></tr>
  </table>

  <div class="foot"><span></span><span>1 / 2</span></div>
</div>

<!-- ================= PAGE 2 ================= -->
<div class="page p2">
  <div class="p2head"><span class="t">履歴書</span><span class="n">ヘルゲルト・ルカ　／　HELGERT Luca　　{DATE_TEXT}</span></div>
  <table class="lic thick">
    <tr><th>年</th><th>月</th><th>免　許・資　格</th></tr>
    <tr><td>2025</td><td>3</td><td>日本語能力 N2レベル（Kai日本語スクール修了）</td></tr>
    <tr><td>{DATE_AI900[0]}</td><td>{DATE_AI900[1]}</td><td>Microsoft Certified: Azure AI Fundamentals（AI-900）　取得</td></tr>
    <tr><td>{DATE_JHMA[0]}</td><td>{DATE_JHMA[1]}</td><td>JHMA認定　ホスピタリティ資格（NPO法人 日本ホスピタリティ推進協会）　取得</td></tr>
  </table>

  <table class="skills thick">
    <tr><th>PCスキル・ツール</th><th>語学・趣味</th></tr>
    <tr>
      <td>
        <div class="g"><span class="k">ゲームエンジン</span><span>Unity / C#（3年）、Shader Graph<br>Unreal Engine（Blueprint）/ C++（1年）</span></div>
        <div class="g"><span class="k">3D・環境</span><span>Blender、World Machine、Cinema 4D、Blockbench</span></div>
        <div class="g"><span class="k">2D・映像</span><span>Photoshop、GIMP、Clip Studio Paint、Illustrator</span></div>
        <div class="g"><span class="k">サウンド</span><span>Logic Pro X、Ableton（作曲歴6年以上）</span></div>
        <div class="g"><span class="k">開発環境</span><span>Git / GitHub、WebGL、HTML、Windows / macOS</span></div>
      </td>
      <td>
        <div class="g"><span class="k kk">語学</span><span>ドイツ語（母語）<br>日本語（N2レベル）<br>英語（CEFR B2）</span></div>
        <div class="g" style="margin-top:1.6mm"><span class="k kk">趣味</span><span>ゲーム制作、アニメ鑑賞<br>作曲・音楽制作、3Dアート</span></div>
      </td>
    </tr>
  </table>

  <table class="pr thick">
    <tr><th>志望動機</th></tr>
    <tr><td>
      <h4>父のお下がりのPCで始まった夢を、東京で形にしています</h4>
      <p>幼い頃からゲームに夢中で、やがて日本のゲーム、<span style="white-space:nowrap">『ダークソウル』</span><span style="white-space:nowrap">『龍が如く0』</span><span style="white-space:nowrap">『メタルギア ライジング』</span><span style="white-space:nowrap">『デビル メイ クライ』</span>に惹かれました。「作る側として日本で働きたい」と、ドイツの片田舎から2023年に来日。日本語は2年でN2に到達しました。</p>
      <p>私の強みは、音・絵・コードを一人で作れることです。6年間の作曲家経験、アーティストの兄の影響で育った美術の眼、そしてプログラミング。この3つをつなぐ職種が、テクニカルアーティストでした。</p>
      <p>TECH.C.では、企業連携で1位、東京ゲームショウ出展まで経験しました。貴社でも、見た目と動きと音を一つにまとめ、作品の魅力を高めます。</p>
    </td></tr>
  </table>

  <table class="pr thick">
    <tr><th>自己PR</th></tr>
    <tr><td>
      <h4>絵もコードも。チームの「通訳」になれます</h4>
      <p>プログラム、3D、シェーダーを一人で扱えるため、美術と開発の「伝わらない」を減らせます。企業連携では7チーム中1位、校内では全学年の最優秀作品に選ばれました。</p>

      <h4>チームの困りごとを、行動で解決します</h4>
      <ul>
        <li>・役割が曖昧で作業が重なった時は、自らテクニカルアーティストを担い、全員の担当を明確にしました。</li>
        <li>・アイデアが増え続けた時は、優先順位をつけて絞り、期限内に完成させました。</li>
        <li>・21人の開発では、進捗を早めに共有し、待ち時間をなくしました。</li>
      </ul>

      <h4>3年間の飲食店勤務で、日本の職場を学びました</h4>
      <p>外国人のお客様にすし作りを教えながら、日本の職場のしくみと上下関係を、現場で身につけました。</p>

      <h4>ドイツ育ち×日本語N2×作曲6年</h4>
      <p>3か国語で話し、音楽も作れます。空手やジムで心身を整え、制作過程を発信しています。SNS合計1.9万人、最高400万回再生。</p>

      <p class="links">【作品集】 {PORTFOLIO}　／　Instagram：instagram.com/lucanicohe</p>
    </td></tr>
  </table>

  <table class="wish thick" style="margin-bottom:0">
    <tr><th>本人希望記入欄（給料・職種・勤務時間・勤務地・その他についての希望があれば記入）</th></tr>
    <tr><td>在学中はアルバイト、2028年3月の卒業後はフルタイムでの勤務を希望いたします。<br>志望職種：テクニカルアーティスト<br>その他は貴社の規定に従います。</td></tr>
  </table>

  <div class="foot"><span></span><span>2 / 2</span></div>
</div>
</body></html>
"""

(HERE / "resume.html").write_text(html, encoding="utf-8")
import re as _re
_t = lambda x: _re.sub(r"<[^>]+>|\s", "", x)
_boxes = _re.findall(r'<th>(志望動機|自己PR)</th></tr>\s*<tr><td>([\s\S]*?)</td></tr>', html)
for _n, _b in _boxes:
    _b = _b.split('<p class="links">')[0]
    print(_n, "chars (incl. headlines):", len(_t(_b)))

# ---------------------------------------------------------------- render PDF
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto((HERE / "resume.html").as_uri())
    page.wait_for_timeout(400)
    page.pdf(path=str(HERE / "resume.pdf"), width="210mm", height="297mm",
             print_background=True, prefer_css_page_size=True)
    browser.close()

# ---------------------------------------------------------------- preview image (2 pages side by side)
import pypdfium2 as pdfium
from PIL import Image

pdf = pdfium.PdfDocument(str(HERE / "resume.pdf"))
print("pages:", len(pdf))
imgs = [pdf[i].render(scale=1.6).to_pil().convert("RGB") for i in range(len(pdf))]
gap = 28
W = sum(i.width for i in imgs) + gap * (len(imgs) + 1)
H = max(i.height for i in imgs) + gap * 2
sheet = Image.new("RGB", (W, H), (233, 233, 229))
x = gap
for im in imgs:
    sheet.paste(im, (x, gap))
    x += im.width + gap
sheet.thumbnail((2000, 2000))
sheet.save(HERE / "resume-preview.jpg", quality=86, optimize=True)
for i, im in enumerate(imgs):
    im.save(HERE / f"_page{i+1}.png")
print("done")
