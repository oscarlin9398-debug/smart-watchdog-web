import React from 'react';
import { ShieldCheck, Map, BarChart2, Search, Scale, MessageSquare, AlertCircle, GraduationCap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onOpenReport }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #2563eb, #1e3a8a)' }}>
            <GraduationCap size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">
              新北市校園治理情報平台
              <span className="brand-version">NTPC v3.0</span>
            </div>
            <div className="brand-subline">
              新北市高中・國中・國小・幼托・校安食安與深度治理預警系統
            </div>
          </div>
        </div>

        {/* Live Key Metrics for NTPC */}
        <div className="stats-strip">
          <div className="stat-pill">
            <span>新北總收錄</span>
            <strong>{stats.total} 所</strong>
          </div>
          <div className="stat-pill" style={{ background: '#f1f5f9' }}>
            <span>高中職</span>
            <strong style={{ color: '#2563eb' }}>{stats.highSchoolCount}</strong>
          </div>
          <div className="stat-pill" style={{ background: '#f1f5f9' }}>
            <span>國中</span>
            <strong style={{ color: '#4f46e5' }}>{stats.juniorCount}</strong>
          </div>
          <div className="stat-pill" style={{ background: '#f1f5f9' }}>
            <span>國小</span>
            <strong style={{ color: '#0284c7' }}>{stats.elemCount}</strong>
          </div>
          <div className="stat-pill" style={{ background: '#f1f5f9' }}>
            <span>幼托園所</span>
            <strong style={{ color: '#059669' }}>{stats.preschoolCount}</strong>
          </div>
          <div className="stat-pill high">
            <span>高風險</span>
            <strong>{stats.high}</strong>
          </div>
          <div className="stat-pill" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <span>裁處罰鍰</span>
            <strong style={{ color: '#2563eb' }}>NT$ {(stats.totalFines / 10000).toFixed(0)} 萬</strong>
          </div>
        </div>

        {/* Action & Nav Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <nav className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <Map size={15} strokeWidth={2} /> 新北地理圖台
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart2 size={15} strokeWidth={2} /> 新北統計
            </button>
            <button
              className={`tab-btn ${activeTab === 'institutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('institutions')}
            >
              <Search size={15} strokeWidth={2} /> 名冊檢索
            </button>
            <button
              className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              <Scale size={15} strokeWidth={2} /> 雙校對比
            </button>
            <button
              className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
              onClick={() => setActiveTab('agent')}
            >
              <MessageSquare size={15} strokeWidth={2} /> AI 稽查室
            </button>
          </nav>


          {/* Citizen Incident Report Button */}
          <button
            onClick={onOpenReport}
            style={{
              padding: '7px 13px',
              borderRadius: 'var(--radius-full)',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 1px 2px rgba(225, 29, 72, 0.08)',
              transition: 'all 0.16s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#ffe4e6'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#fff1f2'; }}
          >
            <AlertCircle size={15} /> 校安通報沙盒
          </button>
        </div>
      </div>
    </header>
  );
}
