import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Bot, AlertTriangle, CheckCircle, MapPin, Building, Phone, Star, Scale, AlertOctagon, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

const NTPC_DISTRICTS = [
  'ALL', '板橋區', '新莊區', '中和區', '三重區', '新店區', '土城區', '永和區',
  '汐止區', '蘆洲區', '樹林區', '淡水區', '三峽區', '鶯歌區', '林口區', '五股區',
  '泰山區', '八里區', '瑞芳區', '深坑區', '金山區', '三芝區', '雙溪區', '烏來區'
];

export default function InstitutionsTab({ institutions, onOpenAudit, onAskAi, onQuickCompare }) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [quickTag, setQuickTag] = useState('ALL');
  const [sortBy, setSortBy] = useState('score-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Filter and Sort logic
  const filtered = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 on filter change
    return institutions
      .filter(item => {
        const s = search.trim().toLowerCase();
        const sNorm = s.replace(/高中/g, '高級中學').replace(/國中/g, '國民中學').replace(/國小/g, '國民小學');
        const hasAlias = item.aliases && item.aliases.some(a => a.toLowerCase().includes(s) || s.includes(a.toLowerCase()));
        const matchSearch = search === '' ||
          item.name.toLowerCase().includes(s) ||
          item.name.toLowerCase().includes(sNorm) ||
          item.district.includes(search) ||
          item.address.includes(search) ||
          hasAlias;
        
        const matchDistrict = districtFilter === 'ALL' || item.district === districtFilter;
        const matchRisk = riskFilter === 'ALL' || item.risk_category === riskFilter;

        let matchLevel = true;
        if (levelFilter === 'HIGH') matchLevel = item.type.includes('高中') || item.type.includes('高職');
        else if (levelFilter === 'JUNIOR') matchLevel = item.type.includes('國中');
        else if (levelFilter === 'ELEM') matchLevel = item.type.includes('國小');
        else if (levelFilter === 'PRE') matchLevel = item.type.includes('幼兒園');

        let matchTag = true;
        if (quickTag === 'HIGH_SCHOOL') matchTag = item.type.includes('高中') || item.type.includes('高職');
        else if (quickTag === 'JUNIOR_SCHOOL') matchTag = item.type.includes('國中');
        else if (quickTag === 'ELEM_SCHOOL') matchTag = item.type.includes('國小');
        else if (quickTag === 'PRESCHOOL') matchTag = item.type.includes('幼兒園');
        else if (quickTag === 'VIOLATION') matchTag = item.violation_count > 0;
        else if (quickTag === 'HIGH_RATING') matchTag = (item.reviews_data?.google_rating || 0) >= 4.5;
        else if (quickTag === 'BENFORD_ALERT') matchTag = item.benford?.fin_risk_score >= 50;

        return matchSearch && matchDistrict && matchLevel && matchRisk && matchTag;
      })
      .sort((a, b) => {
        if (sortBy === 'score-desc') return b.total_score - a.total_score;
        if (sortBy === 'score-asc') return a.total_score - b.total_score;
        if (sortBy === 'fines-desc') return b.total_fines - a.total_fines;
        if (sortBy === 'violations-desc') return b.violation_count - a.violation_count;
        if (sortBy === 'rating-desc') return (b.reviews_data?.google_rating || 0) - (a.reviews_data?.google_rating || 0);
        if (sortBy === 'rating-asc') return (a.reviews_data?.google_rating || 5) - (b.reviews_data?.google_rating || 5);
        return 0;
      });
  }, [institutions, search, districtFilter, levelFilter, riskFilter, quickTag, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const highCount = useMemo(() => institutions.filter(i => i.type && (i.type.includes('高中') || i.type.includes('高職'))).length, [institutions]);
  const juniorCount = useMemo(() => institutions.filter(i => i.type && i.type.includes('國中')).length, [institutions]);
  const elemCount = useMemo(() => institutions.filter(i => i.type && i.type.includes('國小')).length, [institutions]);
  const preCount = useMemo(() => institutions.filter(i => i.type && i.type.includes('幼兒園')).length, [institutions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Search & Filter Bar */}
      <div className="glass-panel filter-bar" style={{ background: '#ffffff' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: '38px' }}
            placeholder="新北市各級高中、國中、國小、幼兒園名冊檢索：輸入校名、行政區、路名或常用簡稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* District Filter */}
        <select
          className="filter-select"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          {NTPC_DISTRICTS.map(d => (
            <option key={d} value={d}>
              {d === 'ALL' ? '新北市全部行政區' : d}
            </option>
          ))}
        </select>

        {/* School Level Filter */}
        <select
          className="filter-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="ALL">全部學制（高中/國中/國小/幼兒園）</option>
          <option value="HIGH">高級中等學校（高中／高職）</option>
          <option value="JUNIOR">國民中學（公私立國中）</option>
          <option value="ELEM">國民小學（公私立國小）</option>
          <option value="PRE">幼兒園（公立/私立/非營利）</option>
        </select>

        {/* Risk Level Filter */}
        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="ALL">全部風險等級</option>
          <option value="高風險">高風險警戒 (70分+)</option>
          <option value="中風險">中風險重點 (40-69分)</option>
          <option value="低風險">低風險優良 (&lt;40分)</option>
        </select>

        {/* Sort Dropdown */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="score-desc">依風險指標降冪（重點優先）</option>
          <option value="score-asc">依風險指標升冪（合規優良優先）</option>
          <option value="rating-desc">依 Google 評價由高到低</option>
          <option value="rating-asc">依 Google 評價由低到高</option>
          <option value="fines-desc">依處分金額由大到小</option>
          <option value="violations-desc">依裁罰違規案次由多到少</option>
        </select>
      </div>

      {/* Quick Curated Filter Tags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', marginRight: '4px' }}>
          學制與主題快選：
        </span>
        {[
          { id: 'ALL', label: '新北全校冊' },
          { id: 'HIGH_SCHOOL', label: '🎓 高中職 (27所)' },
          { id: 'JUNIOR_SCHOOL', label: '🎒 國民中學 (39所)' },
          { id: 'ELEM_SCHOOL', label: '✏️ 國民小學 (55所)' },
          { id: 'PRESCHOOL', label: '🧸 幼托園所 (288所)' },
          { id: 'VIOLATION', label: '🏛️ 曾遭裁罰在案' },
          { id: 'HIGH_RATING', label: '🌟 4.5+ 星示範校園' }
        ].map(tag => (
          <button
            key={tag.id}
            className={`filter-chip ${quickTag === tag.id ? 'active' : ''}`}
            onClick={() => setQuickTag(tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Results Count & Current Slice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#475569', fontWeight: '500' }}>
        <div>
          新北市符合檢索條件：<strong style={{ color: '#0f172a' }}>{filtered.length}</strong> 所各級學校／園所
          {filtered.length > pageSize && (
            <span style={{ marginLeft: '8px', color: '#64748b' }}>
              （第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} 所）
            </span>
          )}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#cbd5e1' : '#0f172a',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                color: currentPage === totalPages ? '#cbd5e1' : '#0f172a',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Grid of Institution Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
        {paginatedData.map(item => {
          const rev = item.reviews_data;
          const isHigh = item.risk_category === '高風險';
          const isMed = item.risk_category === '中風險';
          
          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                background: '#ffffff',
                border: isHigh ? '1.5px solid #fecdd3' : (isMed ? '1px solid #fde68a' : '1px solid #e2e8f0'),
                borderLeft: isHigh ? '4px solid #e11d48' : (isMed ? '4px solid #d97706' : '4px solid #059669'),
                boxShadow: isHigh ? '0 4px 12px rgba(225, 29, 72, 0.06)' : '0 1px 3px rgba(15, 23, 42, 0.05)'
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`risk-badge ${isHigh ? 'high' : (isMed ? 'medium' : 'low')}`}>
                      {item.risk_category} ({item.total_score} 分)
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#475569', fontWeight: '700' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {rev && (
                      <span style={{ color: '#d97706', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={13} fill="#d97706" /> {rev.google_rating}★
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                          ({rev.review_count})
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.35, marginBottom: '6px' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                  <MapPin size={13} color="#94a3b8" /> {item.address}
                </p>
              </div>

              {/* Core Indicators Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '10px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #e2e8f0',
                fontSize: '0.74rem'
              }}>
                <div>
                  <div style={{ color: '#64748b', marginBottom: '2px' }}>裁罰／案次</div>
                  <div style={{ fontWeight: '800', color: item.violation_count > 0 ? '#e11d48' : '#059669' }}>
                    {item.violation_count > 0 ? `${item.violation_count} 次` : '常態合格'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', marginBottom: '2px' }}>會計班佛</div>
                  <div style={{ fontWeight: '800', color: item.benford?.fin_risk_score >= 50 ? '#e11d48' : '#059669' }}>
                    {item.benford?.fin_risk_score >= 50 ? '異常警示' : '合規常態'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', marginBottom: '2px' }}>核准容量</div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>
                    {item.approved_capacity} 人
                  </div>
                </div>
              </div>

              {/* Tags / Warning Highlights */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '24px' }}>
                {item.nlp?.matched_negative_keywords?.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: '#fff1f2',
                      color: '#be123c',
                      border: '1px solid #fecdd3',
                      fontWeight: '600'
                    }}
                  >
                    ⚠️ {kw}
                  </span>
                ))}
                {item.violation_count === 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      fontWeight: '600'
                    }}
                  >
                    ✓ 稽查零裁罰
                  </span>
                )}
              </div>

              {/* Card Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => onQuickCompare(item)}
                  style={{
                    padding: '7px 0',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  <Scale size={13} /> 加入比對
                </button>
                <button
                  onClick={() => onAskAi(item)}
                  style={{
                    padding: '7px 0',
                    borderRadius: 'var(--radius-sm)',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                >
                  <Bot size={13} /> AI 質詢
                </button>
                <button
                  onClick={() => onOpenAudit(item)}
                  style={{
                    padding: '7px 0',
                    borderRadius: 'var(--radius-sm)',
                    background: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                >
                  <Eye size={13} /> 調閱卷證
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              background: currentPage === 1 ? '#f8fafc' : '#ffffff',
              color: currentPage === 1 ? '#cbd5e1' : '#0f172a',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            上一頁
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage === totalPages ? '#cbd5e1' : '#0f172a',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
