import React, { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { Scale, ArrowRight, Star, AlertTriangle, ShieldCheck, MapPin, Building, ChevronRight, GraduationCap } from 'lucide-react';

export default function CompareTab({ institutions, onOpenAudit }) {
  const [instAId, setInstAId] = useState(institutions[0]?.id);
  const [instBId, setInstBId] = useState(institutions[1]?.id || institutions[0]?.id);

  const instA = institutions.find(i => i.id === instAId) || institutions[0];
  const instB = institutions.find(i => i.id === instBId) || institutions[1];

  // Combined Radar Data
  const subjects = ["裁罰法規違規", "班佛財務異常", "社群負面輿情", "師資異動頻率", "環境公安疑慮"];
  const nameA = instA?.name?.length > 10 ? instA.name.slice(0, 10) + '..' : (instA?.name || '學校A');
  const nameB = instB?.name?.length > 10 ? instB.name.slice(0, 10) + '..' : (instB?.name || '學校B');

  const combinedRadar = subjects.map(sub => ({
    subject: sub,
    [nameA]: instA?.radar?.[sub] || 20,
    [nameB]: instB?.radar?.[sub] || 20,
    fullMark: 100
  }));

  if (!instA || !instB) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Selectors */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={22} color="#2563eb" /> 新北市雙校／雙園 治理橫向比對分析
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              任意選擇新北市轄內兩所高中、國中、國小或幼托機構，同步交叉比對行政裁罰、班佛財務偏離、Google 家長學生評價及 5D 雷達圖
            </p>
          </div>
        </div>

        {/* Dual Pickers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', display: 'block', marginBottom: '6px' }}>
              對比標的 A（藍色軸）
            </label>
            <select
              className="filter-select"
              style={{ width: '100%', borderColor: '#bfdbfe', background: '#eff6ff' }}
              value={instAId}
              onChange={(e) => setInstAId(e.target.value)}
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  [{inst.district}] {inst.name}（{inst.type}・{inst.total_score}分・{inst.risk_category}）
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '800', paddingTop: '20px' }}>
            VS
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#059669', display: 'block', marginBottom: '6px' }}>
              對比標的 B（綠色軸）
            </label>
            <select
              className="filter-select"
              style={{ width: '100%', borderColor: '#a7f3d0', background: '#ecfdf5' }}
              value={instBId}
              onChange={(e) => setInstBId(e.target.value)}
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  [{inst.district}] {inst.name}（{inst.type}・{inst.total_score}分・{inst.risk_category}）
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Comparison Body: Left Radar Overlay, Right Metric Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '22px' }}>
        {/* Radar Overlay Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            5 維風險指數量化重疊雷達
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
            數值越高（向外擴散）代表風險與隱憂愈大；面積越緊湊內縮代表整體校園治理愈合規安全
          </p>
          <div style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={combinedRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
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
                  name={instA.name}
                  dataKey={nameA}
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name={instB.name}
                  dataKey={nameB}
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side by Side Metric Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Card A */}
          <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1.5px solid #bfdbfe', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`risk-badge ${instA.risk_category === '高風險' ? 'high' : (instA.risk_category === '中風險' ? 'medium' : 'low')}`}>
                  {instA.risk_category} ({instA.total_score}分)
                </span>
                <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#eff6ff', borderRadius: '4px', color: '#2563eb', fontWeight: '700' }}>
                  {instA.type}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', marginBottom: '4px' }}>
                {instA.name}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '14px' }}>
                📍 {instA.address}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>在籍容量／額度</span>
                  <strong style={{ color: '#0f172a' }}>{instA.approved_capacity} 人</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>裁處／稽核案次</span>
                  <strong style={{ color: instA.violation_count > 0 ? '#e11d48' : '#059669' }}>
                    {instA.violation_count} 次 (NT$ {(instA.total_fines || 0).toLocaleString()})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>班佛財務檢定</span>
                  <strong style={{ color: instA.benford?.fin_risk_score >= 50 ? '#e11d48' : '#059669' }}>
                    {instA.benford?.fin_risk_score} 分 ({instA.benford?.fin_risk_score >= 50 ? '異常警示' : '常態合規'})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Google 星等</span>
                  <strong style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={13} fill="#d97706" /> {instA.reviews_data?.google_rating}★ ({instA.reviews_data?.review_count}則)
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAudit(instA)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              檢視 A 校稽查卷證 <ChevronRight size={14} />
            </button>
          </div>

          {/* Card B */}
          <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1.5px solid #a7f3d0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`risk-badge ${instB.risk_category === '高風險' ? 'high' : (instB.risk_category === '中風險' ? 'medium' : 'low')}`}>
                  {instB.risk_category} ({instB.total_score}分)
                </span>
                <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#ecfdf5', borderRadius: '4px', color: '#059669', fontWeight: '700' }}>
                  {instB.type}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '4px', marginBottom: '4px' }}>
                {instB.name}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '14px' }}>
                📍 {instB.address}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>在籍容量／額度</span>
                  <strong style={{ color: '#0f172a' }}>{instB.approved_capacity} 人</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>裁處／稽核案次</span>
                  <strong style={{ color: instB.violation_count > 0 ? '#e11d48' : '#059669' }}>
                    {instB.violation_count} 次 (NT$ {(instB.total_fines || 0).toLocaleString()})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>班佛財務檢定</span>
                  <strong style={{ color: instB.benford?.fin_risk_score >= 50 ? '#e11d48' : '#059669' }}>
                    {instB.benford?.fin_risk_score} 分 ({instB.benford?.fin_risk_score >= 50 ? '異常警示' : '常態合規'})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Google 星等</span>
                  <strong style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={13} fill="#d97706" /> {instB.reviews_data?.google_rating}★ ({instB.reviews_data?.review_count}則)
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAudit(instB)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              檢視 B 校稽查卷證 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
