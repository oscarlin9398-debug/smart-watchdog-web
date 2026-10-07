import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, User, RefreshCw, GraduationCap } from 'lucide-react';

export default function AiInspectorTab({ institutions, selectedInst, onSelectInst }) {
  const [currentInst, setCurrentInst] = useState(selectedInst || institutions[0]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `您好，我是「新北市校園治理督學智能特派員」。我已載入【${currentInst.name}】（新北市${currentInst.district}，${currentInst.type}，風險評等：${currentInst.total_score}分・${currentInst.risk_category}）之歷年校安公安備查、班佛採購金流檢測、午餐食材食安、Google 親師生評論及現場查驗清單。請點選下方質詢情境，或直接輸入查核問題。`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectChange = (e) => {
    const inst = institutions.find(i => i.id === e.target.value);
    if (inst) {
      setCurrentInst(inst);
      onSelectInst(inst);
      setMessages([
        {
          role: 'assistant',
          content: `已切換至【${inst.name}】（新北市${inst.district}，${inst.type}，風險評等：${inst.total_score}分・${inst.risk_category}）。該校／園核准容量為 ${inst.approved_capacity} 人，累積稽核案次為 ${inst.violation_count} 次，班佛財務風險分值為 ${inst.benford?.fin_risk_score} 分。您可以向我詢問校舍公安防墜、午餐食安檢驗或社群口碑等事項。`
        }
      ]);
    }
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      if (query.includes('班佛') || query.includes('財務') || query.includes('採購')) {
        reply = `【新北市校園會計採購・班佛定律檢定報告】\n受檢標的：${currentInst.name}\n1. 統計檢定指標：卡方值 $\\chi^2 = ${currentInst.benford.chi_square}$，顯著性 $p = ${currentInst.benford.p_value}$。\n2. 財務風險分值：${currentInst.benford.fin_risk_score} 分（診斷結論：${currentInst.benford.benford_status}）。\n3. 督學查核建議：${currentInst.benford.fin_risk_score >= 50 ? '首位數字分佈輕微偏離自然模式，建議實地調閱學校或園所合作社、午餐團膳採購單據與收據存根聯，核對是否符合預算會計核銷法規。' : '大宗採購與常規支出首位數字完全吻合常態分佈，金流往來自然合規。'}`;
      } else if (query.includes('裁罰') || query.includes('違規') || query.includes('查驗') || query.includes('食安')) {
        reply = `【歷年主管機關聯合稽查與裁處案次分析】\n受檢標的：${currentInst.name}（${currentInst.type}）\n1. 累積處分案次：${currentInst.violation_count} 次（累積罰鍰：NT$ ${(currentInst.total_fines || 0).toLocaleString()} 元）。\n2. 查驗事實摘要：${currentInst.violation_history.length > 0 ? currentInst.violation_history.map(v => `[${v.date}] ${v.type} - ${v.detail} (${v.penalty_status})`).join('；') : '歷次校舍公安、午餐食安、教保員資格抽查均無重大違規，全數合規合格通過。'}\n3. 專案指示：重點抽驗高樓層防墜防夾設施、中央廚房食材登錄留樣 48 小時及定期消防檢修申報合格書。`;
      } else if (query.includes('評價') || query.includes('口碑') || query.includes('學生') || query.includes('家長')) {
        reply = `【社群輿情與親師生大數據評析】\n受檢標的：${currentInst.name}\n1. Google Maps 星等：${currentInst.reviews_data?.google_rating} ★（累計 ${currentInst.reviews_data?.review_count} 則在地評價）。\n2. 語意傾向評等：${currentInst.nlp?.sentiment_label}（情緒指數 ${currentInst.nlp?.sentiment_value}）。\n3. 關注標籤：${currentInst.nlp?.matched_negative_keywords?.length > 0 ? currentInst.nlp.matched_negative_keywords.join('、') : '校風純樸、師資熱忱、環境優良'}\n4. 親師生重點口碑：家長普遍對教師教學責任感與多元社團活動給予高度肯定，部分校友提醒放學時段周邊路段車流量大，應遵守校方接送分流動線。`;
      } else {
        reply = `【新北市校園治理行動綜合建議】\n受檢標的：${currentInst.name}\n1. 市府排定稽查優先度：${currentInst.inspection_priority}。\n2. 督學到校查驗清單：\n${currentInst.audit_checklist.map((c, i) => `  (${i+1}) ${c}`).join('\n')}\n3. 綜合處遇方針：落實校園安全自主檢核機制，並每學期追蹤消防安全講習與避難演練成效。`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 450);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '22px', height: 'calc(100vh - 110px)' }}>
      {/* Left Target Profile */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#ffffff' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            🎯 選擇新北受檢學校／園所
          </label>
          <select
            className="filter-select"
            style={{ width: '100%', borderColor: '#cbd5e1' }}
            value={currentInst.id}
            onChange={handleSelectChange}
          >
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                [{inst.district}] {inst.name}（{inst.type}・{inst.total_score}分）
              </option>
            ))}
          </select>
        </div>

        {/* Selected Profile Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className={`risk-badge ${currentInst.risk_category === '高風險' ? 'high' : (currentInst.risk_category === '中風險' ? 'medium' : 'low')}`}>
              {currentInst.risk_category} ({currentInst.total_score}分)
            </span>
            <span style={{ color: '#d97706', fontWeight: '800' }}>
              ★ {currentInst.reviews_data?.google_rating} ({currentInst.reviews_data?.review_count}則)
            </span>
          </div>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {currentInst.name}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.76rem', marginBottom: '12px' }}>
            📍 {currentInst.address}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>違規／查核</span>
              <div style={{ fontWeight: '800', color: currentInst.violation_count > 0 ? '#e11d48' : '#059669' }}>
                {currentInst.violation_count} 次查驗案
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>班佛財務分</span>
              <div style={{ fontWeight: '800', color: currentInst.benford?.fin_risk_score >= 50 ? '#e11d48' : '#059669' }}>
                {currentInst.benford?.fin_risk_score} 分
              </div>
            </div>
          </div>
        </div>

        {/* Quick Scenario Chips */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '8px' }}>
            ⚡ 快捷稽查質詢情境：
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              "檢視本校班佛採購金流異常檢定細節",
              "調閱教育局歷史校安食安與查驗紀錄",
              "分析社群口碑與親師生真實評價",
              "產出實地到校稽查核對清單與處遇建議"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.16s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                <Sparkles size={14} color="#2563eb" /> {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Chat Chamber */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.94rem', color: '#0f172a' }}>
                新北 AI 督學助理・情境推演沙盒
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                當前受檢標的：{currentInst.name}（{currentInst.type}）
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([{
              role: 'assistant',
              content: `對話已重設。我是「新北市校園治理督學智能特派員」，已準備好為您研判【${currentInst.name}】之風險指標與查核策略。`
            }])}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              fontSize: '0.74rem',
              fontWeight: '700',
              padding: '5px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={13} /> 清除對話
          </button>
        </div>

        {/* Message History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%'
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0, marginTop: '2px' }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{
                padding: '14px 18px',
                borderRadius: '14px',
                background: m.role === 'user' ? '#2563eb' : '#ffffff',
                color: m.role === 'user' ? '#ffffff' : '#0f172a',
                border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                whiteSpace: 'pre-line'
              }}>
                {m.content}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0, marginTop: '2px' }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#2563eb', fontSize: '0.8rem', paddingLeft: '44px' }}>
              <Bot size={16} className="animate-spin" /> AI 督學模型正在深度推演比對校安規章與財務卷證...
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="search-input"
            style={{ flex: 1, padding: '10px 16px', background: '#f8fafc' }}
            placeholder={`輸入對【${currentInst.name}】的查驗質詢（例如：如何查核此校午餐食安或校舍公安？）...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !loading ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={15} /> 執行質詢
          </button>
        </div>
      </div>
    </div>
  );
}
