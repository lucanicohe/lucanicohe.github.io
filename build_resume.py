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
AGE = 28                       # shown as 満28歳 (birth date is intentionally not shown)
EMAIL = "luca.helgert@icloud.com"
PORTFOLIO = "github.com/lucanicohe"        # change to your portfolio URL if different

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

work = [
    ("2017", "", "ドイツにてフリーランス作曲家として活動開始"),
    ("", "", "　YouTubeチャンネルで楽曲を発信し、登録者数1.5万人を達成"),
    ("2023", "", "フリーランス作曲家としての活動を終了（約6年間）"),
]

html = f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>履歴書 — Luca Helgert</title>
<style>
@page {{ size: 210mm 297mm; margin: 0 }}
* {{ box-sizing: border-box }}
html, body {{ margin: 0; padding: 0 }}
body {{ font-family: "Noto Sans CJK JP", "Noto Sans JP", sans-serif; color: #000; font-size: 9pt; -webkit-print-color-adjust: exact }}
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
.id td {{ height: 7mm }}
.id tr.name td {{ height: 20mm }}
.id tr.age td {{ height: 11.5mm }}
.name-main {{ font-size: 23pt; letter-spacing: .02em; line-height: 1; }}
.name-sub {{ font-size: 9pt; text-align: right; color: #222 }}
.furi {{ font-size: 9.5pt; letter-spacing: .25em }}
.contact {{ margin-top: -.3mm }}
.contact td {{ height: 11mm; font-size: 10pt }}
.contact td.small {{ font-size: 8.5pt }}
.contact td.label {{ font-size: 7.5pt; height: auto }}
.contact td.label.m {{ font-size: 9pt }}
.hist {{ margin-top: 7mm }}
.hist td {{ height: 7.55mm; font-size: 9pt }}
.hist td:nth-child(1) {{ width: 18mm; text-align: center }}
.hist td:nth-child(2) {{ width: 11mm; text-align: center }}
.hist th {{ height: 7.55mm }}
.end {{ text-align: right !important }}
.foot {{ position: absolute; left: 14mm; right: 14mm; bottom: 7mm; font-size: 7pt; color: #444; display: flex; justify-content: space-between }}

/* PAGE 2 */
.p2 table {{ margin-bottom: 3.2mm }}
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
.pr td {{ vertical-align: top; padding: 2mm 3.2mm 2.2mm; font-size: 8.05pt; line-height: 1.56 }}
.pr h4 {{ margin: 0 0 .1mm; font-size: 8.3pt; font-weight: 700 }}
.pr h4:not(:first-child) {{ margin-top: 1.3mm }}
.pr p {{ margin: 0 }}
.pr ul {{ margin: 0; padding: 0; list-style: none }}
.pr li {{ padding-left: 3.2mm; text-indent: -3.2mm }}
.pr .links {{ margin-top: 1.5mm; font-size: 7.6pt }}
.wish th {{ height: 6mm; font-size: 8pt }}
.wish td {{ height: 14mm; vertical-align: top; padding: 2mm 3.2mm; font-size: 8.5pt; line-height: 1.6 }}
</style></head>
<body>

<!-- ================= PAGE 1 ================= -->
<div class="page">
  <div class="titlebar"><h1>履歴書</h1><span class="date">{DATE_TEXT}</span></div>

  <div class="top">
    <div class="left">
      <table class="id thick">
        <tr><td class="label">ふりがな</td><td class="furi">るか・へるげると</td></tr>
        <tr class="name"><td class="label" style="font-size:9pt">氏　名</td>
          <td style="position:relative"><span class="name-main">ルカ・ヘルゲルト</span>
            <span style="position:absolute;right:2.5mm;top:2mm" class="name-sub">Luca Helgert</span></td></tr>
        <tr class="age"><td class="label">年齢・国籍</td>
          <td><span style="font-size:10.5pt">（満　{AGE}　歳）</span><span style="margin-left:14mm;font-size:10.5pt">国籍：ドイツ</span></td></tr>
      </table>
    </div>
    <div class="photo"><img src="data:image/jpeg;base64,{photo_b64}" alt=""></div>
  </div>

  <table class="contact thick" style="margin-top:3mm">
    <tr><td class="label">ふりがな</td><td class="furi" style="font-size:9pt;height:7mm">とうきょうと</td></tr>
    <tr><td class="label m">現住所</td><td style="font-size:11pt">東京都 <span style="font-size:8pt;color:#333;margin-left:3mm">※番地以下は選考時にお伝えいたします</span></td></tr>
    <tr><td class="label">e-mail</td><td>{EMAIL}</td></tr>
    <tr><td class="label m">電話</td><td class="small">メールにてご連絡をお願いいたします（電話番号は選考時にお伝えいたします）</td></tr>
  </table>

  <table class="hist thick">
    <tr><th>年</th><th>月</th><th>学歴</th></tr>
    {rows(education, 1)}
    <tr><th>年</th><th>月</th><th>職歴</th></tr>
    {rows(work, 2)}
    <tr><td></td><td></td><td class="end">以上</td></tr>
  </table>

  <div class="foot"><span></span><span>1 / 2</span></div>
</div>

<!-- ================= PAGE 2 ================= -->
<div class="page p2">
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
        <div class="g"><span class="k">生成AI</span><span>Claude、Cursor、Google Antigravity（補助ツールとして活用）</span></div>
      </td>
      <td>
        <div class="g"><span class="k kk">語学</span><span>ドイツ語（母語）<br>日本語（N2レベル）<br>英語（CEFR B2）</span></div>
        <div class="g" style="margin-top:1.6mm"><span class="k kk">趣味</span><span>ゲーム制作、アニメ鑑賞<br>作曲・音楽制作、3Dアート</span></div>
      </td>
    </tr>
  </table>

  <table class="pr thick">
    <tr><th>志望動機・自己PR</th></tr>
    <tr><td>
      <h4>【志望動機】</h4>
      <p>幼少期からアニメを通じて日本の文化と歴史に惹かれ、日本で暮らし、いつか日本に貢献することを長年の夢としてきました。ドイツの小さな町で育ち、「自分の力で未来を築きたい」と考えて2023年に来日しました。技術と創造性の両方を活かせるゲーム開発の道を選び、現在は東京デザインテクノロジーセンター専門学校でゲームプログラミングを学んでいます。</p>
      <p>貴社のようなプロのチームで、品質へのこだわりと開発の進め方を学びたいと考えております。シェーダー、ライティング、エフェクト、環境表現でゲームの見た目と体験を高めるテクニカルアーティストとして、またプログラマーとして、チームの制作に貢献いたします。将来は、多くの人に愛される作品を生み出し、日本のゲーム業界に貢献することが目標です。</p>

      <h4>【自己PR】</h4>
      <h4 style="font-weight:500;margin-top:0">① アイデアを「遊べる形」まで完成させる力</h4>
      <p>企画から実装、仕上げまでを一人で完結させる制作を続けており、ブラウザで遊べる個人制作作品を13本公開しています。プログラミングに加え、3Dモデリング、シェーダー、UI、プロシージャル生成、物理演算、逆運動学（IK）など幅広い領域に対応できます。</p>

      <h4 style="font-weight:500">② 学内での実績</h4>
      <ul>
        <li>・「Guilty Lane」（5人・3か月）：2025〜2026年度、全学年の作品の中から最優秀作品に選出。プログラム・アート・音楽を担当。</li>
        <li>・「デカめの一杯」（5人・2か月）：学内大会で優勝。魚の挙動やキャッチ処理のスクリプトをすべて自力で実装。</li>
        <li>・「Toy Pair」（21人・6か月）：東京ゲームショウに学校のトップ展示として出展。ギミックのプログラムを担当。</li>
        <li>・「イカイカす」（5人・2か月）：水中表現（シェーダー・屈折・ライティング）が教員から高い評価。</li>
      </ul>

      <h4 style="font-weight:500">③ リーダー経験</h4>
      <p>「クモ vs. マホウ」（5人・6か月）では、チームリーダー兼プランナーとして企画立案、仕様書の作成、工程管理を担当。プログラム、ビジュアルエフェクト、地形制作、作曲も自ら行い、期限内に完成させました。</p>

      <h4 style="font-weight:500">④ 技術と美的感覚の両立</h4>
      <p>兄の影響で幼少期から3Dに親しみ、3D制作歴は5年以上です。UnityとUnreal Engineで、シェーダー、ライティング、ポストプロセスによる画づくりに取り組んでいます。6年間の作曲家経験を活かし、サウンドも含めてゲーム体験を設計できます。</p>

      <h4 style="font-weight:500">⑤ 情報発信力と多文化対応力</h4>
      <p>制作過程をInstagram（フォロワー約3,000人）とYouTubeで発信し、最も再生された動画は400万回を超えました。ドイツ語・日本語・英語でのコミュニケーションが可能で、ホスピタリティ資格で学んだ姿勢をチーム内外の対話に活かします。</p>

      <h4 style="font-weight:500">⑥ 生成AIとの向き合い方</h4>
      <p>生成AIは補助的な道具として活用し、方向性と最終的な品質の判断は自分で行います。AI使用の程度は、作品ごとにポートフォリオへ明記しています。</p>

      <p class="links">【作品集】 {PORTFOLIO}　／　Instagram：instagram.com/lucanicohe　／　YouTube：youtube.com/@musicformed</p>
    </td></tr>
  </table>

  <table class="wish thick" style="margin-bottom:0">
    <tr><th>本人希望記入欄（給料・職種・勤務時間・勤務地・その他についての希望があれば記入）</th></tr>
    <tr><td>在学中はアルバイト、2028年3月の卒業後はフルタイムでの勤務を希望いたします。職種はテクニカルアーティストを第一希望とし、ゲームプログラマーも歓迎です。その他は貴社の規定に従います。</td></tr>
  </table>

  <div class="foot"><span></span><span>2 / 2</span></div>
</div>
</body></html>
"""

(HERE / "resume.html").write_text(html, encoding="utf-8")

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
