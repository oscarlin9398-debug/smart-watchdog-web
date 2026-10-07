import React, { useState } from 'react';
import { X, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

export default function WhistleblowerModal({ institutions, onClose, onSubmitReport }) {
  const [targetId, setTargetId] = useState(institutions[0]?.id);
  const [incidentType, setIncidentType] = useState('校園安全或環境設施缺失');
  const [date, setDate] = useState('2026-09-13');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedInst = institutions.find(i => i.id === targetId) || institutions[0];
  const isPreschool = selectedInst?.type && (selectedInst.type.includes('幼兒園') || selectedInst.type.includes('幼托'));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.trim()) return;

    // Trigger report callback
    onSubmitReport({
      targetId,
      incidentType,
      date,
      details
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 3000, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <CheckCircle2 size={54} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              通報已受理並即時連動加權
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
              感謝您的公民監督！該校／園所【{selectedInst.name}】之風險指標已動態增提權重，並排入本週督學實地抽檢優先清單。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                  公民異常案件舉報沙盒
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  通報內容將即時啟動風險動態模擬，並通知權責教育行政主管機關
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                受檢舉學校／園所機構
              </label>
              <select
                className="filter-select"
                style={{ width: '100%', borderColor: '#cbd5e1' }}
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    [{inst.district}] {inst.name} ({inst.type})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  異常事由類別
                </label>
                <select
                  className="filter-select"
                  style={{ width: '100%', borderColor: '#cbd5e1' }}
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                >
                  {isPreschool ? (
                    <>
                      <option value="疑似超額收托與師資比不符">疑似超額收托與師生比不符</option>
                      <option value="不當管教或身心虐待情事">不當管教或身心虐待情事</option>
                      <option value="未具合格教保資格人員任教">未聘具合格教保資格師資</option>
                      <option value="巧立名目擅自收取未核備代辦費">巧立名目擅自收取未核備代辦費</option>
                      <option value="幼童專用車超載或違法改裝">幼童專用車超載或違法改裝</option>
                      <option value="營養餐點衛生不良或食材縮水">營養餐點衛生不良或食材縮水</option>
                      <option value="校園環境消防防墜設施缺失">校園環境消防防墜設施缺失</option>
                    </>
                  ) : (
                    <>
                      <option value="校園霸凌或不當管教情事">校園霸凌或不當管教情事</option>
                      <option value="營養午餐食安衛生或食材登錄不實">營養午餐食安衛生或食材登錄不實</option>
                      <option value="校舍消防安全或走廊防墜設施缺失">校舍消防安全或走廊防墜設施缺失</option>
                      <option value="學雜費代辦費收取違反教育局規範">學雜費代辦費收取違反教育局規範</option>
                      <option value="未依規定常態編班或違反收費標準">未依規定常態編班或違反收費標準</option>
                      <option value="公務採購標案或會計帳目登載不實">公務採購標案或會計帳目登載不實</option>
                      <option value="其他違反各級學校法規事項">其他違反各級學校法規事項</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  發現或事發日期
                </label>
                <input
                  type="date"
                  className="search-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                具體事證與情節陳述
              </label>
              <textarea
                className="search-input"
                style={{ width: '100%', minHeight: '90px', resize: 'vertical', lineHeight: 1.5 }}
                placeholder={isPreschool ? "請具體敘述班級名稱、違規時間、師資狀況或環境安全疑慮等事證..." : "請具體敘述年級班級、發生時間、相關人員或具體違反校安食安法規之事證..."}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  padding: '9px 22px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#e11d48',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)'
                }}
              >
                <Send size={15} /> 提交事證並重算權重
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
