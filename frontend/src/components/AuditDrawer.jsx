import React, { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { X, ShieldAlert, FileText, CheckSquare, MessageSquare, AlertCircle, Printer, Bot, Star, ThumbsUp } from 'lucide-react';

export default function AuditDrawer({ inst, onClose, onAskAi, onPrint }) {
  if (!inst) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'violations' | 'benford' | 'reviews' | 'checklist'
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Format Radar Data
  const radarData = Object.entries(inst.radar || {}).map(([subject, value]) => ({
    subject,
    value,
    fullMark: 100
  }));

  // Format Benford Data
  const benfordData = (inst.benford?.observed_distribution || []).map((obs, idx) => ({
    digit: `${idx + 1}`,
    '實測機率': Number((obs * 100).toFixed(1)),
    '班佛理論基準': Number(((inst.benford?.theoretical_distribution?.[idx] || 0) * 100).toFixed(1))
  }));

  const isHigh = inst.risk_category === '高風險';
  const isMed = inst.risk_category === '中風險';

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`risk-badge ${isHigh ? 'high' : (isMed ? 'medium' : 'low')}`}>
                {inst.risk_category}（{inst.total_score} 分）
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#f1f5f9', color: '#475569', fontWeight: '600' }}>
                {inst.type}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
              {inst.name}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              📍 {inst.address} ｜ ☎️ {inst.phone}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => onPrint(inst)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Printer size={14} /> 列印備查單
            </button>
            <button
              onClick={() => onAskAi(inst)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Bot size={14} /> AI 質詢
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation in Drawer */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'overview', label: '五維綜合評定' },
            { id: 'violations', label: `違規裁罰記錄 (${inst.violation_count})` },
            { id: 'benford', label: '班佛財務常態檢定' },
            { id: 'reviews', label: `網路評價 (${inst.reviews_data?.google_rating || 0}★)` },
            { id: 'checklist', label: '實地稽查清單' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(15,23,42,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section based on Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 5-D Radar */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                5 維度風險量化雷達評定
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '14px' }}>
                指標越高代表風險疑慮越顯著；合規標準建議各項指標控制於 35 分以下。
              </p>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#0f172a',
                        boxShadow: '0 8px 20px rgba(15,23,42,0.1)'
                      }}
                    />
                    <Radar
                      name={inst.name}
                      dataKey="value"
                      stroke={isHigh ? '#e11d48' : (isMed ? '#d97706' : '#059669')}
                      fill={isHigh ? '#f43f5e' : (isMed ? '#f59e0b' : '#10b981')}
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stat Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '0.74rem', marginBottom: '4px' }}>市府排定查核優先度</div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.86rem' }}>
                  {inst.inspection_priority}
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '0.74rem', marginBottom: '4px' }}>
                  {inst.type.includes('幼兒園') ? '核准收托量與師生配比' : (inst.type.includes('高中') || inst.type.includes('高職') ? '核定學生規模與師資編制' : '核定學生規模與班級編制')}
                </div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.86rem' }}>
                  {inst.type.includes('幼兒園') 
                    ? `核准 ${inst.approved_capacity} 人（幼兒教育及照顧法上限 1:15）`
                    : (inst.type.includes('高中') || inst.type.includes('高職')
                        ? `核定 ${inst.approved_capacity} 名學生（高級中等教育法常態編班配置）`
                        : (inst.type.includes('國中')
                            ? `核定 ${inst.approved_capacity} 名學生（國民教育法常態編班標準）`
                            : `核定 ${inst.approved_capacity} 名學童（國小常態員額與師資配置）`))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'violations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a' }}>
                歷史聯合稽查與行政處分卷證
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: '700' }}>
                累積罰鍰：NT$ {inst.total_fines.toLocaleString()} 元整
              </span>
            </div>

            {inst.violation_history.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ color: '#047857', fontWeight: '800', fontSize: '0.95rem', marginBottom: '4px' }}>
                  ✓ 查無重大違規與行政處分在案
                </div>
                <div style={{ color: '#065f46', fontSize: '0.78rem' }}>
                  歷次教育局、消保官及建管公安聯合抽查均全數合規合格通過。
                </div>
              </div>
            ) : (
              inst.violation_history.map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#9f1239', fontSize: '0.88rem' }}>
                      違規案由：{v.type}
                    </span>
                    <span style={{ fontWeight: '800', color: '#e11d48', fontSize: '0.86rem' }}>
                      處分罰鍰：NT$ {v.fine.toLocaleString()} 元
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    處分日期：{v.date} ｜ 函文字號：{v.doc_no}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, marginTop: '4px' }}>
                    【處分事實與裁量基準】{v.detail}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.74rem', color: '#047857', fontWeight: '700' }}>
                    ✔ 辦理狀態：{v.penalty_status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'benford' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                班佛法則（Benford's Law）首位數字分佈檢驗
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#64748b' }}>
                藉由分析學雜費、退費及代辦費交易金額首位數字（1~9）分佈，偵測是否有人為虛報、湊整逃漏或拆單異常。
              </p>
            </div>

            {/* Benford Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>卡方檢定值 (Chi-Square)</span>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', marginTop: '2px' }}>
                  {inst.benford.chi_square}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>顯著性 p-value</span>
                <div style={{ fontWeight: '800', color: inst.benford.p_value < 0.05 ? '#e11d48' : '#059669', fontSize: '1rem', marginTop: '2px' }}>
                  {inst.benford.p_value}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>財務異常風險分</span>
                <div style={{ fontWeight: '800', color: inst.benford.fin_risk_score >= 60 ? '#e11d48' : '#059669', fontSize: '1rem', marginTop: '2px' }}>
                  {inst.benford.fin_risk_score} 分
                </div>
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                首位數字分佈直方圖（%）
              </h4>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benfordData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="digit" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#0f172a',
                        boxShadow: '0 8px 20px rgba(15,23,42,0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="實測機率" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="班佛理論基準" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: inst.benford.fin_risk_score >= 60 ? '#fff1f2' : '#eff6ff',
              border: inst.benford.fin_risk_score >= 60 ? '1px solid #fecdd3' : '1px solid #bfdbfe',
              fontSize: '0.8rem',
              color: inst.benford.fin_risk_score >= 60 ? '#be123c' : '#1e40af'
            }}>
              <strong>診斷結論：</strong>{inst.benford.benford_status}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={24} fill="#d97706" /> {inst.reviews_data?.google_rating}
                  <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: '500' }}>
                    / 5.0（共 {inst.reviews_data?.review_count} 則評價）
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                  NLP 語意探勘：{inst.nlp?.sentiment_label}
                </div>
              </div>
            </div>

            {/* Review Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(inst.reviews_data?.reviews || []).map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.86rem' }}>
                        {rev.author}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {rev.source}・{rev.date}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d97706', fontWeight: '800', fontSize: '0.82rem' }}>
                      <Star size={13} fill="#d97706" /> {rev.rating} 星
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                    {rev.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {rev.tags?.map((t, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#f1f5f9', color: '#475569', fontWeight: '600' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsUp size={12} /> {rev.helpful_count} 人覺得有幫助
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a' }}>
              稽查小組實地到園查驗核對清單
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              公務督學或家長參訪時，可逐筆點擊勾選實地核實狀況：
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inst.audit_checklist.map((item, idx) => {
                const isChecked = checkedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: isChecked ? '#ecfdf5' : '#f8fafc',
                      border: isChecked ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#065f46' : '#0f172a',
                      fontWeight: isChecked ? '700' : '500',
                      textDecoration: isChecked ? 'line-through' : 'none'
                    }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
