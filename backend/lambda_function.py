# -*- coding: utf-8 -*-
"""AWS Lambda handler (stdlib only) mirroring app.py's REST endpoints,
for use behind an API Gateway REST API proxy integration."""
import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "institutions.json")
try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        INSTITUTIONS = json.load(f)
except Exception as e:
    print(f"Error loading institutions data: {e}")
    INSTITUTIONS = []

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Content-Type": "application/json",
}


def _response(status, body):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False),
    }


def _get_statistics():
    total = len(INSTITUTIONS)
    high = sum(1 for i in INSTITUTIONS if i["risk_category"] == "高風險")
    medium = sum(1 for i in INSTITUTIONS if i["risk_category"] == "中風險")
    low = sum(1 for i in INSTITUTIONS if i["risk_category"] == "低風險")
    total_fines = sum(i.get("total_fines", 0) for i in INSTITUTIONS)
    total_violations = sum(i.get("violation_count", 0) for i in INSTITUTIONS)
    return {
        "total": total,
        "high": high,
        "medium": medium,
        "low": low,
        "total_fines": total_fines,
        "total_violations": total_violations,
    }


def _list_institutions(params):
    city = params.get("city")
    risk = params.get("risk")
    keyword = params.get("keyword")

    results = INSTITUTIONS
    if city and city != "ALL":
        results = [i for i in results if city in i["city"]]
    if risk and risk != "ALL":
        results = [i for i in results if i["risk_category"] == risk]
    if keyword:
        kw = keyword.lower()
        results = [
            i for i in results
            if kw in i["name"].lower() or kw in i["district"] or kw in i["address"]
        ]
    return results


def _get_institution(inst_id):
    inst = next((i for i in INSTITUTIONS if i["id"] == inst_id), None)
    if not inst:
        return {"error": "Institution not found"}
    return inst


def _chat_with_agent(inst_id, message):
    inst = next((i for i in INSTITUTIONS if i["id"] == inst_id), None)
    if not inst:
        return {"reply": "查無此機構資料,請確認機構編號。"}

    msg = message.lower()
    if "稽查" in msg or "突擊" in msg or "清單" in msg:
        reply = (
            f"【{inst['name']} 突擊稽查指示】\n"
            f"1. 現場清查在園幼兒人數,比對核定容量 {inst['approved_capacity']} 人。\n"
            f"2. 調閱最近 30 日監視器錄影,排除死角。\n"
            f"3. 比對教職員合格證書與投保名冊。\n"
            f"4. 查驗廚房食品留樣 48 小時合規性。"
        )
    elif "財務" in msg or "班佛" in msg:
        reply = (
            f"【{inst['name']} 班佛財務分析】\n"
            f"異常指標:{inst['benford']['fin_risk_score']} 分,狀態:{inst['benford']['benford_status']}。\n"
            f"建議調閱近六個月對外收款單據與收費備查項目是否相符。"
        )
    else:
        reply = (
            f"已收到針對 {inst['name']} 的諮詢。該機構目前風險總分為 {inst['total_score']} 分"
            f"({inst['risk_category']}),累計裁罰 {inst['violation_count']} 次。"
            f"建議參照五維雷達圖評估其照顧安全。"
        )
    return {"reply": reply}


def handler(event, context):
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}
    path_params = event.get("pathParameters") or {}

    if method == "OPTIONS":
        return _response(200, {})

    if path == "/" and method == "GET":
        return _response(200, {
            "system": "小小守護員 Smart Watchdog",
            "version": "2.0.0",
            "status": "online",
            "total_institutions": len(INSTITUTIONS),
        })

    if path == "/api/statistics" and method == "GET":
        return _response(200, _get_statistics())

    if path == "/api/institutions" and method == "GET":
        return _response(200, _list_institutions(params))

    if path.startswith("/api/institution/") and method == "GET":
        inst_id = path_params.get("inst_id") or path.rsplit("/", 1)[-1]
        return _response(200, _get_institution(inst_id))

    if path == "/api/chat" and method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return _response(400, {"error": "Invalid JSON body"})
        return _response(200, _chat_with_agent(body.get("inst_id", ""), body.get("message", "")))

    return _response(404, {"error": "Not found"})
