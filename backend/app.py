# -*- coding: utf-8 -*-
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os

app = FastAPI(
    title="新北市校園治理情報平台 API",
    description="新北市各級學校與教保機構 智慧風險稽查與預警系統 API",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "institutions.json")
try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        INSTITUTIONS = json.load(f)
except Exception as e:
    print(f"Error loading institutions data: {e}")
    INSTITUTIONS = []

@app.get("/")
def read_root():
    ntpc = [i for i in INSTITUTIONS if i.get("city") == "新北市"]
    return {
        "system": "新北市校園治理情報平台 API (NTPC v3.0)",
        "status": "online",
        "total_institutions": len(INSTITUTIONS),
        "ntpc_institutions": len(ntpc)
    }

@app.get("/api/statistics")
def get_statistics():
    ntpc = [i for i in INSTITUTIONS if i.get("city") == "新北市"]
    total = len(ntpc)
    high = len([i for i in ntpc if i.get("risk_category") == "高風險"])
    medium = len([i for i in ntpc if i.get("risk_category") == "中風險"])
    low = len([i for i in ntpc if i.get("risk_category") == "低風險"])
    total_fines = sum(i.get("total_fines", 0) for i in ntpc)

    return {
        "total_institutions": total,
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "total_fines": total_fines,
        "high_schools": len([i for i in ntpc if "高中" in i.get("type", "") or "高職" in i.get("type", "")]),
        "junior_highs": len([i for i in ntpc if "國中" in i.get("type", "")]),
        "elem_schools": len([i for i in ntpc if "國小" in i.get("type", "")]),
        "preschools": len([i for i in ntpc if "幼兒園" in i.get("type", "")])
    }

@app.get("/api/institutions")
def get_institutions(
    city: str = Query(None, description="縣市篩選"),
    risk: str = Query(None, description="風險等級"),
    keyword: str = Query(None, description="關鍵字搜尋")
):
    results = [i for i in INSTITUTIONS if i.get("city") == "新北市"] if not city else [i for i in INSTITUTIONS if city in i.get("city", "")]

    if risk and risk != "ALL":
        results = [i for i in results if i.get("risk_category") == risk]
    if keyword:
        kw = keyword.lower().strip()
        # Normalization variants for smart fuzzy search
        kw_norm1 = kw.replace("高中", "高級中學").replace("國中", "國民中學").replace("國小", "國民小學")
        results = [
            i for i in results
            if kw in i["name"].lower()
            or kw_norm1 in i["name"].lower()
            or kw in i.get("district", "").lower()
            or kw in i.get("address", "").lower()
            or any(kw in str(a).lower() for a in i.get("aliases", []))
            or any(str(a).lower() in kw for a in i.get("aliases", []))
        ]

    return results

@app.get("/api/institution/{inst_id}")
def get_institution(inst_id: str):
    inst = next((i for i in INSTITUTIONS if i["id"] == inst_id), None)
    if not inst:
        return {"error": "Institution not found"}
    return inst

class ChatRequest(BaseModel):
    inst_id: Optional[str] = None
    message: str

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    inst = None
    if req.inst_id:
        inst = next((i for i in INSTITUTIONS if i["id"] == req.inst_id), None)

    msg = req.message.lower()
    if inst:
        if "稽查" in msg or "突擊" in msg or "清單" in msg:
            reply = f"【{inst['name']} 突擊稽查指示】\n1. 現場清查在校/園人數，比對核定容量 {inst.get('approved_capacity', 100)} 人。\n2. 調閱最近 30 日監視器錄影，排除死角。\n3. 比對教職員合格證書與勞健保投保名冊。\n4. 查驗中央廚房食材登錄平台與留樣 48 小時合規性。"
        elif "財務" in msg or "班佛" in msg:
            b_score = inst.get("benford", {}).get("fin_risk_score", 20)
            b_status = inst.get("benford", {}).get("benford_status", "合規")
            reply = f"【{inst['name']} 班佛財務分析】\n異常指標：{b_score} 分，狀態：{b_status}。\n建議調閱近六個月大宗採購與代辦費收支單據是否相符。"
        else:
            reply = f"針對 {inst['name']}：該機構目前風險總分為 {inst['total_score']} 分（{inst['risk_category']}），累計裁罰 {inst.get('violation_count', 0)} 次。建議參照五維雷達圖評估其校園安全。"
    else:
        ntpc = [x for x in INSTITUTIONS if x.get("city") == "新北市"]
        high_ntpc = [x for x in ntpc if x.get("risk_category") == "高風險"]
        reply = f"【新北市校園治理 AI 稽查總覽】\n新北市目前納管各級學校與幼托共 {len(ntpc)} 所，其中列為第一級高風險加強列管者共 {len(high_ntpc)} 所（涉及師生比超收、食材農藥超標或標案金流異常）。建議教育局公安聯合稽查小組優先針對高風險名冊排定現場實地督導。"

    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
