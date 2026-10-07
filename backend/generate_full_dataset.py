# -*- coding: utf-8 -*-
import json
import random
import math

DISTRICTS = {
    # 台北市 (12 區全覆蓋)
    "台北市-大安區": {"lat": (25.020, 25.045), "lng": (121.530, 121.555)},
    "台北市-信義區": {"lat": (25.025, 25.048), "lng": (121.560, 121.585)},
    "台北市-中山區": {"lat": (25.050, 25.080), "lng": (121.520, 121.545)},
    "台北市-中正區": {"lat": (25.018, 25.045), "lng": (121.510, 121.530)},
    "台北市-松山區": {"lat": (25.045, 25.068), "lng": (121.550, 121.575)},
    "台北市-大同區": {"lat": (25.050, 25.075), "lng": (121.505, 121.520)},
    "台北市-萬華區": {"lat": (25.020, 25.045), "lng": (121.490, 121.510)},
    "台北市-文山區": {"lat": (24.980, 25.010), "lng": (121.535, 121.575)},
    "台北市-南港區": {"lat": (25.035, 25.060), "lng": (121.595, 121.625)},
    "台北市-內湖區": {"lat": (25.065, 25.095), "lng": (121.570, 121.605)},
    "台北市-士林區": {"lat": (25.085, 25.120), "lng": (121.515, 121.550)},
    "台北市-北投區": {"lat": (25.120, 25.150), "lng": (121.495, 121.525)},

    # 新北市 (各大核心與衛星行政區全覆蓋)
    "新北市-板橋區": {"lat": (25.005, 25.035), "lng": (121.450, 121.478)},
    "新北市-中和區": {"lat": (24.985, 25.015), "lng": (121.485, 121.510)},
    "新北市-永和區": {"lat": (25.002, 25.020), "lng": (121.505, 121.522)},
    "新北市-新莊區": {"lat": (25.025, 25.060), "lng": (121.420, 121.458)},
    "新北市-三重區": {"lat": (25.060, 25.088), "lng": (121.475, 121.505)},
    "新北市-新店區": {"lat": (24.955, 24.985), "lng": (121.530, 121.560)},
    "新北市-土城區": {"lat": (24.965, 24.990), "lng": (121.435, 121.458)},
    "新北市-蘆洲區": {"lat": (25.075, 25.095), "lng": (121.465, 121.488)},
    "新北市-汐止區": {"lat": (25.060, 25.080), "lng": (121.650, 121.680)},
    "新北市-樹林區": {"lat": (24.985, 25.005), "lng": (121.415, 121.435)},
    "新北市-三峽區": {"lat": (24.925, 24.945), "lng": (121.365, 121.385)},
    "新北市-鶯歌區": {"lat": (24.945, 24.965), "lng": (121.345, 121.365)},
    "新北市-淡水區": {"lat": (25.165, 25.190), "lng": (121.435, 121.455)},
    "新北市-林口區": {"lat": (25.065, 25.090), "lng": (121.355, 121.385)},
    "新北市-五股區": {"lat": (25.080, 25.100), "lng": (121.425, 121.445)},

    # 桃園市
    "桃園市-桃園區": {"lat": (24.985, 25.015), "lng": (121.295, 121.328)},
    "桃園市-中壢區": {"lat": (24.950, 24.980), "lng": (121.215, 121.245)},
    "桃園市-平鎮區": {"lat": (24.935, 24.955), "lng": (121.205, 121.225)},
    "桃園市-八德區": {"lat": (24.940, 24.960), "lng": (121.275, 121.295)},
    "桃園市-蘆竹區": {"lat": (25.035, 25.060), "lng": (121.285, 121.305)},

    # 台中市
    "台中市-西屯區": {"lat": (24.160, 24.195), "lng": (120.625, 120.665)},
    "台中市-南屯區": {"lat": (24.130, 24.160), "lng": (120.630, 120.658)},
    "台中市-北屯區": {"lat": (24.170, 24.200), "lng": (120.670, 120.700)},
    "台中市-西區": {"lat": (24.140, 24.155), "lng": (120.655, 120.675)},
    "台中市-北區": {"lat": (24.155, 24.170), "lng": (120.670, 120.690)},

    # 台南市
    "台南市-東區": {"lat": (22.980, 23.000), "lng": (120.215, 120.240)},
    "台南市-中西區": {"lat": (22.985, 23.005), "lng": (120.190, 120.210)},
    "台南市-永康區": {"lat": (23.015, 23.045), "lng": (120.235, 120.265)},

    # 高雄市
    "高雄市-左營區": {"lat": (22.670, 22.700), "lng": (120.290, 120.320)},
    "高雄市-三民區": {"lat": (22.640, 22.670), "lng": (120.305, 120.340)},
    "高雄市-苓雅區": {"lat": (22.620, 22.638), "lng": (120.305, 120.335)},
    "高雄市-鼓山區": {"lat": (22.645, 22.670), "lng": (120.275, 120.295)},
    "高雄市-鳳山區": {"lat": (22.615, 22.640), "lng": (120.345, 120.370)}
}

ELEMENTARY_SCHOOLS = [
    "大安", "新生", "金華", "建安", "幸安", "敦化", "光復", "信義", "三興", "仁愛",
    "忠孝", "長安", "吉林", "永安", "大直", "南門", "東門", "中正", "河堤", "民生",
    "民權", "健康", "西松", "雙蓮", "大同", "蓬萊", "老松", "西門", "萬大", "景美",
    "木柵", "志清", "靜心", "南港", "胡適", "東新", "明湖", "麗山", "西湖", "士林",
    "雨農", "天母", "百齡", "北投", "石牌", "義方", "板橋", "莒光", "海山", "埔墘",
    "江翠", "文聖", "新埔", "中和", "光興", "秀朗", "永和", "頂溪", "新莊", "民安",
    "裕民", "光華", "三重", "正義", "厚德", "修德", "新店", "大豐", "中正", "北新"
]

FOUNDATIONS = [
    "彭婉如文教基金會", "靖娟兒童安全文教基金會", "心路社會福利基金會",
    "伊甸社會福利基金會", "兒童福利聯盟文教基金會", "台灣幼兒早期教育學會",
    "誠品文化藝術基金會", "慈濟傳播人文志業基金會", "家扶基金會"
]

BRANDS = [
    "何嘉仁", "吉的堡", "康橋國際", "貝登堡", "愛迪生", "劍橋英倫",
    "向日葵", "小太陽", "快樂森林", "大都會", "彩虹天使", "陽光育苗",
    "育才雙語", "長頸鹿", "童話王國", "全方位", "小天使", "智慧星",
    "安心托兒", "萌芽精緻", "哈佛幼教", "百瀚文理", "青蘋果", "四季花園",
    "仁愛", "信義", "和平", "博愛", "希望之光", "諾貝爾", "格林童話",
    "小熊維尼", "奇異果", "蘋果樹", "普林斯頓", "牛津劍橋", "加州陽光",
    "維多利亞", "常春藤", "森林小鹿", "蒲公英", "小樹苗", "蔚藍海岸"
]

VIOLATION_CATALOG = [
    {
        "type": "師生比例不符",
        "law": "幼兒教育及照顧法第 16 條第 1 項",
        "detail": "大班應配置 1:15，實際現場 1 位主教老師照護 24 名幼兒，嚴重影響照顧品質。",
        "severity": 30,
        "base_fine": 30000
    },
    {
        "type": "進用未具資格人員",
        "law": "幼兒教育及照顧法第 32 條第 1 項",
        "detail": "查獲隨班人員未具備合格教保員證書，違規從事實際教保活動。",
        "severity": 35,
        "base_fine": 50000
    },
    {
        "type": "超收幼兒隱匿不報",
        "law": "幼兒教育及照顧法第 41 條",
        "detail": "核定收托幼兒數超限，實地突檢查獲二樓或地下室隱蔽空間藏匿超收幼童。",
        "severity": 45,
        "base_fine": 150000
    },
    {
        "type": "不當管教與身心虐待",
        "law": "教保相關人員違法事件調查處理辦法第 4 條",
        "detail": "監視器調閱查證屬實，教保人員因幼童哭鬧予以拉扯手部、強迫罰站逾 30 分鐘。",
        "severity": 55,
        "base_fine": 300000
    },
    {
        "type": "點心餐飲衛生違規",
        "law": "食品安全衛生管理法第 8 條",
        "detail": "廚房抽查發現調味料逾有效日期，且未依規定留存食品檢體 48 小時備查。",
        "severity": 20,
        "base_fine": 15000
    },
    {
        "type": "消防公共安全不合格",
        "law": "建築法第 77 條第 1 項",
        "detail": "逃生避難走道堆置大型教具雜物阻礙動線，自動灑水設備回水閥故障未修復。",
        "severity": 30,
        "base_fine": 60000
    },
    {
        "type": "監視錄影設備未依規定留存",
        "law": "幼兒園監視錄影設備設置及資訊管理辦法",
        "detail": "主管機關到園抽查要求調閱指定教室錄影，業者宣稱硬碟故障未能提供影音。",
        "severity": 40,
        "base_fine": 80000
    },
    {
        "type": "巧立名目違規收費",
        "law": "幼兒教育及照顧法第 38 條第 1 項",
        "detail": "除地方政府備查收費外，額外強制收取高額未核准之教材或才藝費。",
        "severity": 25,
        "base_fine": 40000
    }
]

BENFORD_THEORETICAL = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046]

REVIEW_AUTHORS = [
    "小檸檬媽咪", "大安區家長 Chen", "新北雙寶爸", "幼教關注者 Lin",
    "安安媽", "翔翔拔", "晴晴媽咪", "上班族地方媽媽",
    "PTT 媽寶板友", "Dcard 育兒板友", "熱心鄰居阿姨", "王老師 (退休教保員)",
    "兩寶都在這的家長", "剛轉走的家長", "幼幼班現役家長", "陳爸爸",
    "林媽媽 (小班)", "張小姐", "黃先生", "大同區雙寶媽", "三民區家長"
]

POSITIVE_REVIEWS = [
    {
        "rating": 5,
        "text": "老師非常有耐心與愛心，我家小孩放學每天都很開心。聯絡簿紀錄詳盡，溝通管道透明，非常推薦！",
        "tags": ["師資有愛心", "溝通良好", "適應良好"]
    },
    {
        "rating": 5,
        "text": "餐點都是聘請合格專職廚工現煮，每週菜單公開透明，食材新鮮乾淨。活動空間採光通風優良。",
        "tags": ["自煮健康餐", "採光通風", "環境寬敞"]
    },
    {
        "rating": 5,
        "text": "師生比維持得非常好，小班制顧得很周全。監視器影像保存透明，行政老師親切專業。",
        "tags": ["師生比優良", "監視器透明", "行政親切"]
    },
    {
        "rating": 4,
        "text": "校園乾淨明亮，每個月都有主題繪本與消防演練，孩子在自理能力和生活常規上進步非常多。",
        "tags": ["生活自理", "課程多元", "安全演練"]
    }
]

CRITICAL_REVIEWS = [
    {
        "rating": 1,
        "text": "極度不推薦！孩子回家身上有不明瘀青，詢問老師支支吾吾，要求調閱監視器說硬碟故障，事後通報才發現多次被開罰！",
        "tags": ["疑似體罰", "監視器故障疑雲", "推諉卸責"]
    },
    {
        "rating": 1,
        "text": "嚴重超收！常常看到二樓鐵捲門拉下來，裡面其實藏了好幾個小孩。老師流動率高得嚇人，一學期換三個老師！",
        "tags": ["嚴重超收", "師資流動大", "黑心隱匿"]
    },
    {
        "rating": 2,
        "text": "收據常常沒蓋章，強制要買客製教材每學期好幾萬。退費手續拖了三個多月還不處理，態度惡劣！",
        "tags": ["巧立名目收費", "退費糾紛", "態度傲慢"]
    },
    {
        "rating": 2,
        "text": "參觀時講得天花亂墜，實際進去發現下午點心只給半片吐司配稀水麥片，小孩放學肚子餓得直哭，師生比明顯不符！",
        "tags": ["餐點縮水", "師生比不符", "參觀不實"]
    }
]

NEUTRAL_REVIEWS = [
    {
        "rating": 3,
        "text": "收費在這一區算親民，硬體設備稍微有歷史感。老師算認真但感覺人手很吃緊，希望園方多聘幾位專職隨班人員。",
        "tags": ["設備老舊", "收費合理", "人手吃緊"]
    },
    {
        "rating": 3,
        "text": "教學內容算豐富，雙語活動很多。放學接送時間門口違停比較嚴重，希望能妥善規劃接送動線。",
        "tags": ["接送動線問題", "雙語活動", "空間適中"]
    }
]

def generate_online_reviews(target_risk):
    if target_risk == "high":
        rating = round(random.uniform(1.6, 2.8), 1)
        count = random.randint(45, 230)
        star_dist = {
            "5星": random.randint(5, 15),
            "4星": random.randint(5, 12),
            "3星": random.randint(10, 20),
            "2星": random.randint(20, 35),
            "1星": random.randint(35, 55)
        }
        selected = random.sample(CRITICAL_REVIEWS, 2) + random.sample(NEUTRAL_REVIEWS, 1)
    elif target_risk == "medium":
        rating = round(random.uniform(3.1, 3.9), 1)
        count = random.randint(30, 180)
        star_dist = {
            "5星": random.randint(20, 35),
            "4星": random.randint(20, 30),
            "3星": random.randint(20, 30),
            "2星": random.randint(10, 20),
            "1星": random.randint(10, 20)
        }
        selected = random.sample(CRITICAL_REVIEWS, 1) + random.sample(NEUTRAL_REVIEWS, 1) + random.sample(POSITIVE_REVIEWS, 1)
    else:
        rating = round(random.uniform(4.3, 4.9), 1)
        count = random.randint(50, 320)
        star_dist = {
            "5星": random.randint(65, 85),
            "4星": random.randint(12, 25),
            "3星": random.randint(2, 8),
            "2星": random.randint(0, 3),
            "1星": random.randint(0, 2)
        }
        selected = random.sample(POSITIVE_REVIEWS, 2) + random.sample(NEUTRAL_REVIEWS, 1)

    review_items = []
    dates = ["3 天前", "1 週前", "2 週前", "1 個月前", "2 個月前", "3 個月前", "半年前"]
    sources = ["Google Maps 評論", "PTT 媽寶板", "Dcard 親子育兒板"]

    for r in selected:
        author = random.choice(REVIEW_AUTHORS)
        review_items.append({
            "author": author,
            "rating": r["rating"],
            "date": random.choice(dates),
            "source": random.choice(sources),
            "content": r["text"],
            "tags": r["tags"],
            "helpful_count": random.randint(3, 45)
        })

    return {
        "google_rating": rating,
        "review_count": count,
        "star_distribution": star_dist,
        "reviews": review_items
    }

def generate_benford_profile(risk_level):
    if risk_level == "high":
        anomaly_digit = random.choice([5, 8, 9, 1])
        counts = [random.randint(1, 4) for _ in range(9)]
        counts[anomaly_digit - 1] += random.randint(45, 65)
        total = sum(counts)
        observed = [round(c / total, 3) for c in counts]
        chi_sq = round(random.uniform(42.5, 78.9), 2)
        p_val = 0.0001
        score = random.randint(75, 95)
        status = "高度異常 (班佛檢定未通過，疑似人為調節帳務或虛報)"
        transactions = [random.choice([55000, 58000, 88000, 89000, 99000, 52000, 55000]) for _ in range(12)]
    elif risk_level == "medium":
        counts = [int(BENFORD_THEORETICAL[i] * 100) + random.randint(-8, 12) for i in range(9)]
        counts[random.randint(0, 3)] += 15
        total = sum(counts)
        observed = [round(max(c, 1) / total, 3) for c in counts]
        chi_sq = round(random.uniform(16.0, 26.5), 2)
        p_val = round(random.uniform(0.01, 0.04), 4)
        score = random.randint(45, 68)
        status = "中度偏離 (首位數字分佈輕微異常，建議調閱細部傳票)"
        transactions = [random.randint(12000, 48000) for _ in range(12)]
    else:
        counts = [int(BENFORD_THEORETICAL[i] * 100) + random.randint(-3, 3) for i in range(9)]
        total = sum(counts)
        observed = [round(max(c, 1) / total, 3) for c in counts]
        chi_sq = round(random.uniform(2.1, 9.4), 2)
        p_val = round(random.uniform(0.35, 0.88), 3)
        score = random.randint(5, 25)
        status = "自然正常 (符合班佛定律自然統計分佈)"
        transactions = [int(math.exp(random.uniform(8.5, 11.2))) for _ in range(12)]

    return {
        "observed_distribution": observed,
        "theoretical_distribution": BENFORD_THEORETICAL,
        "chi_square": chi_sq,
        "p_value": p_val,
        "fin_risk_score": score,
        "benford_status": status,
        "sample_transactions": transactions[:8]
    }

def generate_nlp_profile(risk_level):
    if risk_level == "high":
        keywords = ["體罰", "瘀青", "藏小孩", "超收", "黑心", "監視器壞掉", "暗室罰站"]
        matched_kw = random.sample(keywords, random.randint(3, 5))
        score = random.randint(75, 96)
        sentiment_val = round(random.uniform(-0.85, -0.60), 2)
        sentiment_label = "極度負面警戒"
    elif risk_level == "medium":
        keywords = ["流動率高", "超收疑慮", "點心縮水", "無照兼課", "收據未蓋章"]
        matched_kw = random.sample(keywords, random.randint(2, 3))
        score = random.randint(45, 68)
        sentiment_val = round(random.uniform(-0.40, -0.10), 2)
        sentiment_label = "潛在爭議風險"
    else:
        matched_kw = []
        score = random.randint(5, 25)
        sentiment_val = round(random.uniform(0.65, 0.95), 2)
        sentiment_label = "家長正面推崇"

    return {
        "matched_negative_keywords": matched_kw,
        "nlp_risk_score": score,
        "sentiment_value": sentiment_val,
        "sentiment_label": sentiment_label
    }

# 總數設定：共 850 所機構，全面覆蓋全台 40+ 主要行政區！
TOTAL_COUNT = 850
high_target = int(TOTAL_COUNT * 0.16)    # ~136 所高風險
med_target = int(TOTAL_COUNT * 0.32)     # ~272 所中風險
low_target = TOTAL_COUNT - high_target - med_target  # ~442 所低風險

distribution_plan = ["high"] * high_target + ["medium"] * med_target + ["low"] * low_target
random.shuffle(distribution_plan)

institutions = []
inst_counter = 1

for target_risk in distribution_plan:
    loc_key = random.choice(list(DISTRICTS.keys()))
    city, district = loc_key.split("-")
    lat_range = DISTRICTS[loc_key]["lat"]
    lng_range = DISTRICTS[loc_key]["lng"]
    lat = round(random.uniform(lat_range[0], lat_range[1]), 5)
    lng = round(random.uniform(lng_range[0], lng_range[1]), 5)

    # 構造逼真多元的機構名稱
    inst_category = random.choices(
        ["公立附幼", "非營利", "私立準公共", "私立雙語", "公設托嬰", "私立托嬰"],
        weights=[25, 20, 25, 15, 8, 7]
    )[0]

    if inst_category == "公立附幼":
        elem = random.choice(ELEMENTARY_SCHOOLS)
        name = f"{city}立{district}{elem}國民小學附設幼兒園"
        inst_type = "公立幼兒園"
    elif inst_category == "非營利":
        found = random.choice(FOUNDATIONS)
        b = random.choice(BRANDS)
        name = f"{city}{district}{b}非營利幼兒園(委託{found}辦理)"
        inst_type = "非營利幼兒園"
    elif inst_category == "私立準公共":
        b = random.choice(BRANDS)
        name = f"{city}私立{b}{district}幼兒園(準公共)"
        inst_type = "準公共化幼兒園"
    elif inst_category == "私立雙語":
        b = random.choice(BRANDS)
        name = f"{city}私立{b}國際雙語幼兒園"
        inst_type = "私立雙語幼兒園"
    elif inst_category == "公設托嬰":
        b = random.choice(BRANDS)
        name = f"{city}公設民營{district}{b}托嬰中心"
        inst_type = "公設民營托嬰中心"
    else:
        b = random.choice(BRANDS)
        name = f"{city}私立{b}精緻托嬰中心"
        inst_type = "私立托嬰中心"

    if target_risk == "high":
        v_count = random.randint(2, 5)
        sample_violations = random.sample(VIOLATION_CATALOG, v_count)
    elif target_risk == "medium":
        v_count = random.randint(1, 2)
        sample_violations = random.sample(VIOLATION_CATALOG, v_count)
    else:
        v_count = 0 if random.random() < 0.85 else 1
        sample_violations = random.sample(VIOLATION_CATALOG, v_count) if v_count > 0 else []

    violation_history = []
    total_fines = 0
    raw_violation_score = 0
    for v in sample_violations:
        year = random.choice([2023, 2024, 2025, 2026])
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        fine = v["base_fine"] + random.choice([0, 10000, 20000, 50000])
        total_fines += fine
        raw_violation_score += v["severity"]
        violation_history.append({
            "date": f"{year}-{month:02d}-{day:02d}",
            "type": v["type"],
            "law": v["law"],
            "detail": v["detail"],
            "doc_no": f"府教幼字第{year-1911}{random.randint(100000, 999999)}號",
            "fine": fine,
            "penalty_status": random.choice(["已繳納罰鍰並列管複查", "處以罰鍰並命一個月內限期改善", "限期改善未通過，加重處分"])
        })

    violation_history.sort(key=lambda x: x["date"], reverse=True)
    violation_score = min(max(raw_violation_score, 0), 100)
    if target_risk == "low" and v_count == 0:
        violation_score = random.randint(0, 10)

    benford_info = generate_benford_profile(target_risk)
    nlp_info = generate_nlp_profile(target_risk)
    reviews_info = generate_online_reviews(target_risk)

    total_score = int(round(
        violation_score * 0.45 +
        benford_info["fin_risk_score"] * 0.30 +
        nlp_info["nlp_risk_score"] * 0.25
    ))
    total_score = max(3, min(total_score, 99))

    if total_score >= 70:
        risk_category = "高風險"
        badge_color = "#f43f5e"
        inspection_priority = "第一級：極重度列管（48小時內啟動無預警突擊稽查）"
        audit_checklist = [
            "現場清點在園幼兒人數，逐一比對核定名冊與教保服務系統登錄資料。",
            "現場扣留並調閱主機近 30 日全天候監視器錄影，清查死角與暗房。",
            "逐一核對現場全體員工之勞健保投保紀錄、良民證及教保資格清冊。",
            "查驗近半年全園收退費存簿、外開收據存根與家長轉帳明細。",
            "會同衛生局稽查廚房冰箱、食材供應商進貨單及食品留樣 48 小時合規性。"
        ]
    elif total_score >= 40:
        risk_category = "中風險"
        badge_color = "#f59e0b"
        inspection_priority = "第二級：重點抽查（雙週內排定不定期聯合抽檢）"
        audit_checklist = [
            "核對當班師生配比及兼職人員是否落實代理報備程序。",
            "抽查家長收費單據是否與地方主管機關核定收費項目一致。",
            "現場檢視消防逃生通道、安全門防夾手條及滅火器檢驗合格標章。",
            "電訪隨機 5 位家長確認實際作息與餐飲提供是否與申報相符。"
        ]
    else:
        risk_category = "低風險"
        badge_color = "#10b981"
        inspection_priority = "第三級：常態優質（維持每學年一次例行性評鑑訪視）"
        audit_checklist = [
            "例行性校舍公共安全與遊戲設施自主檢查紀錄抽檢。",
            "每學期教職員在職研習 18 小時進修時數核對。"
        ]

    radar_metrics = {
        "裁罰法規違規": violation_score,
        "班佛財務異常": benford_info["fin_risk_score"],
        "社群負面輿情": nlp_info["nlp_risk_score"],
        "師資異動頻率": random.randint(70, 95) if target_risk == "high" else (random.randint(40, 65) if target_risk == "medium" else random.randint(10, 30)),
        "環境公安疑慮": random.randint(65, 90) if target_risk == "high" else (random.randint(35, 60) if target_risk == "medium" else random.randint(10, 25))
    }

    item = {
        "id": f"tw-gov-{inst_counter:04d}",
        "name": name,
        "city": city,
        "district": district,
        "address": f"{city}{district}民生路{random.randint(10, 580)}號",
        "phone": f"02-2{random.randint(100, 999)}-{random.randint(1000, 9999)}" if "台北" in city or "新北" in city else f"0{random.randint(3,7)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "type": inst_type,
        "approved_capacity": random.choice([45, 60, 75, 90, 120, 150, 180, 240]),
        "lat": lat,
        "lng": lng,
        "total_score": total_score,
        "risk_category": risk_category,
        "badge_color": badge_color,
        "inspection_priority": inspection_priority,
        "audit_checklist": audit_checklist,
        "violation_count": len(violation_history),
        "total_fines": total_fines,
        "violation_score": violation_score,
        "violation_history": violation_history,
        "benford": benford_info,
        "nlp": nlp_info,
        "reviews_data": reviews_info,
        "radar": radar_metrics
    }
    institutions.append(item)
    inst_counter += 1

institutions.sort(key=lambda x: x["total_score"], reverse=True)

with open(r"C:\Users\oscar\Desktop\smart-watchdog\frontend\src\data\institutions.json", "w", encoding="utf-8") as f:
    json.dump(institutions, f, ensure_ascii=False, indent=2)

with open(r"C:\Users\oscar\Desktop\smart-watchdog\backend\data\institutions.json", "w", encoding="utf-8") as f:
    json.dump(institutions, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(institutions)} institutions covering all districts!")