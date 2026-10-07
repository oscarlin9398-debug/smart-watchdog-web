import React, { useState, useEffect, useMemo } from 'react';
import bundledData from './data/institutions.json';
import Navbar from './components/Navbar';
import MapTab from './components/MapTab';
import AnalyticsTab from './components/AnalyticsTab';
import InstitutionsTab from './components/InstitutionsTab';
import CompareTab from './components/CompareTab';
import AiInspectorTab from './components/AiInspectorTab';
import AuditDrawer from './components/AuditDrawer';
import PrintModal from './components/PrintModal';
import WhistleblowerModal from './components/WhistleblowerModal';

export default function App() {
  const [institutions, setInstitutions] = useState(bundledData);
  const [activeTab, setActiveTab] = useState('map');
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printInst, setPrintInst] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Attempt to sync with backend API if available (falls back to bundled data)
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    fetch(`${apiBase}/api/institutions`)
      .then(res => {
        if (!res.ok) throw new Error('Network not ok');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInstitutions(data);
        }
      })
      .catch(() => {
        // Fallback gracefully to bundledData
      });
  }, []);

  // 核心約束：只顯示新北市資料（高中、國中、國小、幼兒園），其餘縣市資料完整保留於資料庫與底層狀態中不予刪除
  const displayInstitutions = useMemo(() => {
    return institutions.filter(i => i.city === '新北市');
  }, [institutions]);

  const [selectedInst, setSelectedInst] = useState(displayInstitutions[0] || null);

  useEffect(() => {
    if (displayInstitutions.length > 0 && (!selectedInst || selectedInst.city !== '新北市')) {
      setSelectedInst(displayInstitutions[0]);
    }
  }, [displayInstitutions]);

  // Compute Platform KPIs for New Taipei City
  const stats = useMemo(() => {
    const total = displayInstitutions.length;
    const high = displayInstitutions.filter(i => i.risk_category === '高風險').length;
    const medium = displayInstitutions.filter(i => i.risk_category === '中風險').length;
    const low = displayInstitutions.filter(i => i.risk_category === '低風險').length;
    const totalFines = displayInstitutions.reduce((acc, curr) => acc + (curr.total_fines || 0), 0);

    // 分學制統計
    const highSchoolCount = displayInstitutions.filter(i => i.type.includes('高中') || i.type.includes('高職')).length;
    const juniorCount = displayInstitutions.filter(i => i.type.includes('國中')).length;
    const elemCount = displayInstitutions.filter(i => i.type.includes('國小')).length;
    const preschoolCount = displayInstitutions.filter(i => i.type.includes('幼兒園')).length;

    return { total, high, medium, low, totalFines, highSchoolCount, juniorCount, elemCount, preschoolCount };
  }, [displayInstitutions]);

  const handleOpenAudit = (inst) => {
    setSelectedInst(inst);
    setIsAuditOpen(true);
  };

  const handleAskAi = (inst) => {
    setSelectedInst(inst);
    setActiveTab('agent');
  };

  const handlePrint = (inst) => {
    setPrintInst(inst);
    setIsPrintOpen(true);
  };

  const handleQuickCompare = (inst) => {
    setSelectedInst(inst);
    setActiveTab('compare');
  };

  // Live Whistleblower update
  const handleSubmitReport = (report) => {
    setInstitutions(prev => prev.map(item => {
      if (item.id === report.targetId) {
        const newScore = Math.min(item.total_score + 12, 99);
        const newCategory = newScore >= 70 ? '高風險' : (newScore >= 40 ? '中風險' : '低風險');
        return {
          ...item,
          total_score: newScore,
          risk_category: newCategory,
          inspection_priority: '第一級：重度列管（立即排定無預警聯合查核）',
          nlp: {
            ...item.nlp,
            matched_negative_keywords: [...new Set([...(item.nlp?.matched_negative_keywords || []), report.incidentType])]
          }
        };
      }
      return item;
    }));
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main View Container (Focused strictly on New Taipei City K-12 + Preschool) */}
      <main className="app-container">
        {activeTab === 'map' && (
          <MapTab
            institutions={displayInstitutions}
            selectedInst={selectedInst || displayInstitutions[0]}
            onSelectInst={setSelectedInst}
            onOpenAudit={handleOpenAudit}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            institutions={displayInstitutions}
            onOpenAudit={handleOpenAudit}
          />
        )}

        {activeTab === 'institutions' && (
          <InstitutionsTab
            institutions={displayInstitutions}
            onOpenAudit={handleOpenAudit}
            onAskAi={handleAskAi}
            onQuickCompare={handleQuickCompare}
          />
        )}

        {activeTab === 'compare' && (
          <CompareTab
            institutions={displayInstitutions}
            onOpenAudit={handleOpenAudit}
          />
        )}

        {activeTab === 'agent' && (
          <AiInspectorTab
            institutions={displayInstitutions}
            selectedInst={selectedInst || displayInstitutions[0]}
            onSelectInst={setSelectedInst}
          />
        )}
      </main>

      {/* Slide-over Audit Drawer */}
      {isAuditOpen && selectedInst && (
        <AuditDrawer
          inst={selectedInst}
          onClose={() => setIsAuditOpen(false)}
          onAskAi={handleAskAi}
          onPrint={handlePrint}
        />
      )}

      {/* Official Printable Form Modal */}
      {isPrintOpen && printInst && (
        <PrintModal
          inst={printInst}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {/* Citizen Incident Report Modal */}
      {isReportOpen && (
        <WhistleblowerModal
          institutions={displayInstitutions}
          onClose={() => setIsReportOpen(false)}
          onSubmitReport={handleSubmitReport}
        />
      )}
    </div>
  );
}
