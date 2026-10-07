import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';

export default function PrintModal({ inst, onClose }) {
  if (!inst) return null;

  const isPreschool = inst.type && (inst.type.includes('幼兒園') || inst.type.includes('幼托') || inst.type.includes('托嬰'));
  const isHigh = inst.type && (inst.type.includes('高中') || inst.type.includes('高職'));
  const isJunior = inst.type && inst.type.includes('國中');

  const reportTitle = isPreschool
    ? '地方主管教育行政機關・幼兒教保機構實地查核備查表'
    : '地方主管教育行政機關・各級學校暨教育機構實地查核備查表';

  const capacityLabel = isPreschool ? '核准收托量' : '核定學生規模';
  const capacityUnit = isPreschool ? '名幼童' : '名學生';
  const repSignatureLabel = isPreschool ? '幼兒園負責人／代表簽章：' : '受檢學校校長／代表簽章：';

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 3000, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          color: '#0f172a',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Actions Bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#64748b' }}>公務列印預覽模式</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={16} /> 列印 / 匯出 PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              關閉
            </button>
          </div>
        </div>

        {/* Official Printable Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px', color: '#0f172a' }}>
            {reportTitle}
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#475569', marginTop: '6px' }}>
            系統案件編號：{inst.id} ｜ 稽查等級：{inst.inspection_priority} ｜ 風險指標總分：{inst.total_score} 分
          </div>
        </div>

        {/* Basic Information Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
            一、機構基本立案與營運登記事項
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold', width: '22%' }}>機構全銜</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{inst.name}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold', width: '22%' }}>立案類別</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{inst.type}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold' }}>設立地址</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{inst.address}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold' }}>聯絡電話</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{inst.phone}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold' }}>{capacityLabel}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>{inst.approved_capacity} {capacityUnit}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 'bold' }}>風險研判等級</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 'bold', color: inst.risk_category === '高風險' ? '#dc2626' : (inst.risk_category === '中風險' ? '#d97706' : '#059669') }}>
                  {inst.risk_category} ({inst.total_score} 分)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Violations History */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
            二、歷史違規處分紀錄與備查卷證（計 {inst.violation_count} 案次）
          </h3>
          {inst.violation_history.length === 0 ? (
            <div style={{ padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', color: '#059669', background: '#ecfdf5' }}>
              ✓ 查無重大行政處分記錄在案，符合常態稽查合格規定。
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>處分日期</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>違規法規項目</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>處分金額</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>辦理複查狀態</th>
                </tr>
              </thead>
              <tbody>
                {inst.violation_history.map((v, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{v.date}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{v.type} ({v.law})</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#dc2626', fontWeight: 'bold' }}>NT$ {v.fine.toLocaleString()} 元</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{v.penalty_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Checklist */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
            三、現場實地抽查核對項目清冊
          </h3>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', fontSize: '0.85rem' }}>
            {inst.audit_checklist.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #475569', borderRadius: '2px' }}></span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', paddingTop: '24px', borderTop: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
          <div>
            <div>聯合稽查督學／督導簽章：</div>
            <div style={{ height: '48px', borderBottom: '1px solid #cbd5e1', marginTop: '12px' }}></div>
          </div>
          <div>
            <div>教育局主管科室核章：</div>
            <div style={{ height: '48px', borderBottom: '1px solid #cbd5e1', marginTop: '12px' }}></div>
          </div>
          <div>
            <div>{repSignatureLabel}</div>
            <div style={{ height: '48px', borderBottom: '1px solid #cbd5e1', marginTop: '12px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
