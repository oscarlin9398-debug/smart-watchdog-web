import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { AlertOctagon, TrendingUp, DollarSign, ShieldAlert, Award, ArrowUpRight, CheckCircle2, GraduationCap } from 'lucide-react';

const TOP_NTPC_DISTRICTS = [
  '板橋區', '新莊區', '中和區', '三重區', '新店區', '土城區', '永和區',
  '汐止區', '蘆洲區', '樹林區', '淡水區', '林口區', '三峽區', '鶯歌區'
];

export default function AnalyticsTab({ institutions, onOpenAudit }) {
  // Aggregate stats for New Taipei City
  const total = institutions.length;
  const highRisk = institutions.filter(i => i.risk_category === '高風險');
  const mediumRisk = institutions.filter(i => i.risk_category === '中風險');
  const lowRisk = institutions.filter(i => i.risk_category === '低風險');

  const totalFines = institutions.reduce((acc, curr) => acc + (curr.total_fines || 0), 0);
  const totalViolations = institutions.reduce((acc, curr) => acc + (curr.violation_count || 0), 0);

  // 學制分佈統計
  const levelCounts = {
    '高級中等學校 (高中職)': institutions.filter(i => i.type.includes('高中') || i.type.includes('高職')).length,
    '國民中學 (國中)': institutions.filter(i => i.type.includes('國中')).length,
    '國民小學 (國小)': institutions.filter(i => i.type.includes('國小')).length,
    '公私立幼兒園 (幼托)': institutions.filter(i => i.type.includes('幼兒園')).length
  };

  const levelPieData = [
    { name: '高級中等學校', value: levelCounts['高級中等學校 (高中職)'], color: '#2563eb' },
    { name: '國民中學', value: levelCounts['國民中學 (國中)'], color: '#4f46e5' },
    { name: '國民小學', value: levelCounts['國民小學 (國小)'], color: '#0284c7' },
    { name: '幼托機構', value: levelCounts['公私立幼兒園 (幼托)'], color: '#059669' }
  ];

  // District risk distribution in New Taipei City
  const districtData = TOP_NTPC_DISTRICTS.map(dist => {
    const matched = institutions.filter(i => i.district === dist);
    return {
      district: dist.replace('區', ''),
      高風險: matched.filter(i => i.risk_category === '高風險').length,
      中風險: matched.filter(i => i.risk_category === '中風險').length,
      低風險: matched.filter(i => i.risk_category === '低風險').length,
      總數: matched.length
    };
  }).sort((a, b) => b.總數 - a.總數).slice(0, 10);

  // Common inspection & violations
  const violationCounts = {};
  institutions.forEach(inst => {
    inst.violation_history.forEach(v => {
      violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
    });
  });

  const violationData = Object.entries(violationCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topViolations = [...institutions]
    .sort((a, b) => (b.total_fines || 0) - (a.total_fines || 0))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                新北市總收錄學校／園所
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
                {total} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>所</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: '#eff6ff', color: '#2563eb' }}>
              <GraduationCap size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#64748b' }}>
            涵蓋新北 29 行政區公私立高中職、國中、國小與幼托
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1px solid #fecdd3', borderLeft: '4px solid #e11d48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#be123c', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                高風險重點列管機構
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e11d48' }}>
                {highRisk.length} <span style={{ fontSize: '0.9rem', color: '#be123c' }}>所</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: '#fff1f2', color: '#e11d48' }}>
              <AlertOctagon size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#9f1239' }}>
            佔比 {((highRisk.length / total) * 100).toFixed(1)}%・優先無預警聯合抽查
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1px solid #fde68a', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                新北市累積處分金額
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706' }}>
                NT$ {(totalFines / 10000).toFixed(0)} <span style={{ fontSize: '0.9rem', color: '#b45309' }}>萬</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: '#fffbeb', color: '#d97706' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#92400e' }}>
            含幼照法違規與重大查驗案共 {totalViolations} 起
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff', border: '1px solid #a7f3d0', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#047857', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                合規安全示範比例
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>
                {((lowRisk.length / total) * 100).toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#047857' }}>%</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#065f46' }}>
            共 {lowRisk.length} 所各級校園維持常態安全運作
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* District Risk Stacked Bar */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            新北市前十大行政區風險指標分佈
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '18px' }}>
            板橋、新莊、中和、三重、新店、土城、永和、汐止等區各級學校與幼托評等分佈
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="district" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    boxShadow: '0 8px 20px rgba(15,23,42,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="低風險" fill="#059669" stackId="a" />
                <Bar dataKey="中風險" fill="#d97706" stackId="a" />
                <Bar dataKey="高風險" fill="#e11d48" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* School Level Breakdown Pie */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            新北市各級學制收錄比例
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '18px' }}>
            {`高中職 (${levelCounts['公私立高級中學/職校']}所) ｜ 國中 (${levelCounts['公立國民中學']}所) ｜ 國小 (${levelCounts['公立國民小學']}所) ｜ 幼兒園 (${levelCounts['公私立幼兒園 (幼托)']}所)`}
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {levelPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Common Violations & Highest Fine List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Most Frequent Violations */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
            ⚠️ 新北市最常見校安／公安／教保違規類型排行
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {violationData.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: '800',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    {item.type}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#e11d48' }}>
                  {item.count} 案次
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Fine Institutions in New Taipei */}
        <div className="glass-panel" style={{ padding: '22px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
            🚨 新北市裁處金額最高之重點監控機構
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topViolations.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onOpenAudit(item)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#ffe4e6'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff1f2'; }}
              >
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#9f1239' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {item.district}・{item.type}・違規 {item.violation_count} 次
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#e11d48', fontSize: '0.92rem' }}>
                    NT$ {item.total_fines.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '700' }}>
                    調閱卷證 →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
