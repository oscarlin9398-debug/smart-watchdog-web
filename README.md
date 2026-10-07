# 新北市校園治理情報平台 (Smart Watchdog)
> **競賽命題：教保機構風險監測：教育局**
> 全台首創・以數據驅動與生成式 AI 輔助之學前幼托與 K-12 校園多維治理與事前風險預警系統

---

## 🎯 競賽成果交付快速連結 (Quick Links & Deliverables)

- 🌐 **Live Demo 線上展示網址（AWS 正式部署）**：[https://dl0s1ajl0os3y.cloudfront.net](https://dl0s1ajl0os3y.cloudfront.net)（僅開放白名單 IP，見下方 AWS 架構章節）
- 💻 **GitHub 完整原始碼庫**：[https://github.com/LywMD/smart-watchdog](https://github.com/LywMD/smart-watchdog)

---

## 📌 一、專案簡介與問題痛點 (Project Overview & Pain Points)

本專案「**新北市校園治理情報平台**（Smart Watchdog）」專為**新北市政府教育局「教保機構風險監測」**命題量身打造。新北市幅員廣大、人口逾 400 萬，涵蓋 29 個行政區，各級公私立高中職、國中、國小與幼兒園多達 1,500 餘所。

### 🚨 待解決問題、需求或痛點
1. **資料分散與整合困難**：相關基本資料、評鑑、裁罰、收費明細及決算或財務報告，雖為網站公開資訊，但缺乏整合分析機制，且未納入社群即時輿情，難以形成完整風險判斷基礎。
2. **財務異常難以及早發現**：公共化幼兒園之決算或財務報告雖依法規公告，但缺乏與其他資訊（如收費明細、園所基本資料等）交叉分析偵測異常。
3. **風險辨識與預警能力不足**：缺乏標準化、可量化的風險評估工具，無法從大量機構中有效篩選出需優先關注的高風險對象。
4. **人力負擔重與決策支援不足**：機構數量眾多，仰賴人工篩選與判斷耗時費力，且缺乏數據支持的資源配置決策依據。

---

## 🛡️ 二、獨創「5D 校園治理與風險預警模型」

本平台獨家研發「5D 校園多維指標量化模型」，綜合五大維度動態計算 0~100 分之風險評估分數：

| 維度名稱 | 權重 | 核心評估項目與數據特徵 |
| :--- | :---: | :--- |
| **1. 裁罰法規違規維度** | **35%** | 累計違規處分字號、超收幼童人數、黑牌未核備教保員記點、違反《幼照法》條次 |
| **2. 班佛採購財務維度** | **20%** | 大宗營養午餐食材與校舍修繕合約，首創 **班佛定律 (Benford's Law)** 首位數字頻率卡方檢定，防範人為拆單假帳 |
| **3. 社群負面輿情維度** | **20%** | Google Places 公開評價與家長留言文本，運用 NLP 情感分析與負向詞彙（超收、體罰、髒亂、腹瀉）探勘 |
| **4. 師資異動流動維度** | **15%** | 核心師資年度流動率異常、教保員投保與在職核備名冊合規性追蹤 |
| **5. 環境公安食安維度** | **10%** | 校舍防墜設施檢驗合格證明、營養午餐廚房 48 小時留樣檢驗履歷 |

### 🚦 三級風險智慧分流
- 🔴 **高風險機構**：綜合評分達門檻，涉及重大超收、不當管教查證屬實或採購假帳異常。系統自動列入【重點突擊稽查】。
- 🟡 **中風險機構**：偶發行政申報延宕、防墜設施微損限期改善。列入【專案抽查輔導】。
- 🟢 **低風險機構**：營運良好、各項食安公安齊備。列入【常態例行備查】。

---

## 📥 三、數據及資料運用 (Data Sources & Methodology)

本平台無縫整合四大公私領域多源異質官方數據：
1. **教育部全國教保資訊網 API**：立案登記許可、核定收托人數、裁罰處分字號與違反法條。
2. **新北市政府開放資料平台 (NTPC Open Data)**：新北 29 區公私立高中、國中、國小規模、學區與午餐合約。
3. **行政院政府電子採購網 (e-Procurement)**：大宗食材、設施採購與防墜工程之招標決標金額（導入班佛定律檢定防弊）。
4. **Google Places & Maps API**：家長真實星等（1~5星）、評論則數與最新留言文本，供 NLP 情感分析。

---

## ☁️ 四、AWS 雲端技術架構 (AWS Cloud Architecture)

### 目標正式架構 (Target Production Architecture)

平台規劃採現代化 Serverless 與容器微服務架構：

```
[ 終端使用者 / 家長 / 教育局官員 ]
       │ (HTTPS TLS 1.3 傳輸)
       ▼
┌──────────────────────────────────────────────┐
│ Amazon CloudFront (全球 CDN + AWS WAF 防火牆)│ (唯一公開對外入口)
└───────────────┬──────────────────────────────┘
                │
     ┌──────────┴──────────┐
(靜態 SPA 前端)            │ (動態 API: /api/*)
     ▼                     ▼
┌──────────────┐   ┌───────────────────────────┐
│  Amazon S3   │   │ Application Load Balancer │
│ (Block Public│   └─────────────┬─────────────┘
│  Access 開啟)│                 │ (私有 VPC 路由)
│ 透過 OAC 授權│                 ▼
└──────────────┘   ┌───────────────────────────┐
                   │ Amazon ECS Fargate 容器叢集│ (FastAPI 後端)
                   └───────┬───────────┬───────┘
                           │           │
            ┌──────────────┘           └──────────────┐
            ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│ Amazon Aurora RDS       │               │ Amazon Bedrock          │
│ (PostgreSQL 引擎)       │               │ (Claude 模型)           │
│ (Private Subnet 禁外網) │               │ 自動產出突擊稽查指示手冊│
└─────────────────────────┘               └─────────────────────────┘
```

### ✅ 目前實際部署架構 (Currently Deployed - Lean Version)

比賽 Demo 階段採用精簡版架構落地上線,成本低、部署快,並針對指定 IP 做存取管制:

```text
[ 白名單 IP (4 組) ]
        │
        ▼ (HTTPS)
[ Amazon CloudFront + AWS WAF (IP 白名單, 預設 Block) ]
        │
        ▼
[ S3 Bucket (私有, 僅 CloudFront OAC 可讀 - React SPA 前端) ]

[ 白名單 IP (4 組) ]
        │
        ▼ (HTTPS, API Gateway Resource Policy IP 白名單)
[ Amazon API Gateway (REST API) ]
        │
        ▼
[ AWS Lambda (Python, 讀取 institutions.json) ]
```

- 前端網址:`https://dl0s1ajl0os3y.cloudfront.net`
- 後端 API:`https://6u6ksl5e34.execute-api.us-west-2.amazonaws.com/prod`
- **白名單 IP**(僅這 4 組可連線,其餘來源會被 WAF / API Gateway 拒絕):`60.250.71.45`、`61.222.117.53`、`59.125.121.41`、`60.250.71.43`
- 重新部署:執行 [deploy_aws.ps1](deploy_aws.ps1)(重新打包 Lambda、重 build 前端並同步至 S3、清除 CloudFront 快取)

### 🛡️ 安全性與合規性保證
- ✅ **S3 Block Public Access 阻斷公用存取**:S3 儲存桶全數啟用阻斷公開存取,僅允許 Amazon CloudFront 透過 Origin Access Control (OAC) 憑證讀取。
- ✅ **來源 IP 白名單管制**:CloudFront 層以 AWS WAF、API Gateway 層以 Resource Policy,雙層限制僅指定 4 組 IP 可連線。
- ✅ **零個人敏感個資 (No PII)**:嚴格遵循個人資料保護法,僅收錄公開機構資訊與公告違規紀錄,零儲存個人隱私數據。
- ✅ **指定主區域 (Region)**:前後端統一部署於 **AWS us-west-2 (Oregon)**,WAF (CloudFront scope) 於 us-east-1 全域管理。

---

## 💻 五、平台功能特色與介面操作流程

1. **🗺️ 新北市 GIS 地理圖台**:
   - 支援新北 29 行政區快選膠囊(板橋、新莊、中和、永和、淡水等一鍵縮放)。
   - 四大學制即時切換:高中職、國中、國小、幼兒園。
   - 紅黃綠三色即時標註風險熱點,點擊直覺展開學校體檢檔案。
2. **📋 機構治理名冊與 5D 抽屜詳情 (AuditDrawer)**:
   - 多維複合篩選(行政區、學制、風險等級、名稱關鍵字搜尋)。
   - 一鍵篩選「🔴 高風險警示名單」,直接查看裁罰字號、處分事由與現場檢核表。
   - 首創「班佛定律採購分析圖」與「家長評價情感雷達圖」同屏呈現。
3. **⚖️ 雙校五維雷達深度對比**:
   - 支援跨學制/同區任意兩所學校比對。
   - 5 軸雷達重疊圖形化顯示管理強弱項差異。
4. **🤖 AI 智慧稽查室**:
   - 點擊「一鍵產生突擊稽查手冊」,即時條列現場實地盤查項目與《幼照法》對應法條。
5. **🛡️ 匿名吹哨者通報機制**:
   - 支援雜湊防偽存證,去識別化保障檢舉人隱私。

---

## 🚀 本地開發與啟動指南 (Quick Start)

### 1. 啟動後端 API (FastAPI)
```bash
cd backend
pip install fastapi uvicorn pydantic
python -m uvicorn app:app --port 8000 --reload
```
- 後端服務位址:`http://127.0.0.1:8000`
- API Swagger 文件:`http://127.0.0.1:8000/docs`

### 2. 啟動前端介面 (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- 前端網頁位址:`http://localhost:5173`
- 簡報線上觀看:`http://localhost:5173/presentation.html`

---

## 🛠️ 技術棧 (Tech Stack)

- **Frontend**: React 18, Vite, TailwindCSS / Modern Light Theme, Lucide React, Leaflet GIS
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic(本地開發);AWS Lambda(雲端部署,見 [lambda_function.py](backend/lambda_function.py))
- **Data & Analytics**: Pandas, NumPy, Benford's Law Audit Algorithm
- **AI & Cloud**: AWS S3 / CloudFront / WAF / API Gateway / Lambda,規劃中 AWS Bedrock

---

## 📄 授權條款 (License)
本專案依 MIT License 開源發布,提供教育與競賽評審參考。
