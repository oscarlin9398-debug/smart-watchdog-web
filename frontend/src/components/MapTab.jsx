import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Star, AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create Clean Custom Pin
const createCustomPin = (score, risk) => {
  const pinClass = risk === '高風險' ? 'high' : (risk === '中風險' ? 'medium' : 'low');
  return L.divIcon({
    className: 'custom-pin-wrapper',
    html: `<div class="custom-pin ${pinClass}">${score}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

function MapController({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

const DISTRICT_COORDS = {
  'ALL': { center: [25.0125, 121.4658], zoom: 11 },
  '板橋區': { center: [25.012, 121.465], zoom: 13 },
  '新莊區': { center: [25.035, 121.445], zoom: 13 },
  '中和區': { center: [24.995, 121.498], zoom: 13 },
  '三重區': { center: [25.068, 121.488], zoom: 13 },
  '新店區': { center: [24.968, 121.542], zoom: 13 },
  '土城區': { center: [24.978, 121.445], zoom: 13 },
  '永和區': { center: [25.008, 121.515], zoom: 14 },
  '汐止區': { center: [25.065, 121.658], zoom: 13 },
  '蘆洲區': { center: [25.085, 121.471], zoom: 13 },
  '樹林區': { center: [24.995, 121.425], zoom: 13 },
  '淡水區': { center: [25.172, 121.445], zoom: 13 },
  '林口區': { center: [25.081, 121.385], zoom: 13 },
  '三峽區': { center: [24.935, 121.371], zoom: 13 },
  '鶯歌區': { center: [24.948, 121.351], zoom: 13 }
};

export default function MapTab({ institutions, selectedInst, onSelectInst, onOpenAudit }) {
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL'); // 'ALL' | '高中職' | '國中' | '國小' | '幼兒園'
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([25.0125, 121.4658]);
  const [mapZoom, setMapZoom] = useState(11);

  const filteredData = useMemo(() => {
    return institutions.filter(item => {
      const matchDistrict = selectedDistrict === 'ALL' || item.district === selectedDistrict;
      const matchRisk = selectedRisk === 'ALL' || item.risk_category === selectedRisk;
      
      let matchLevel = true;
      if (selectedLevel === '高中職') matchLevel = item.type.includes('高中') || item.type.includes('高職');
      else if (selectedLevel === '國中') matchLevel = item.type.includes('國中');
      else if (selectedLevel === '國小') matchLevel = item.type.includes('國小');
      else if (selectedLevel === '幼兒園') matchLevel = item.type.includes('幼兒園');

      const s = searchQuery.trim().toLowerCase();
      const sNorm = s.replace(/高中/g, '高級中學').replace(/國中/g, '國民中學').replace(/國小/g, '國民小學');
      const hasAlias = item.aliases && item.aliases.some(a => a.toLowerCase().includes(s) || s.includes(a.toLowerCase()));
      const matchQuery = searchQuery === "" ||
        item.name.toLowerCase().includes(s) ||
        item.name.toLowerCase().includes(sNorm) ||
        item.district.includes(searchQuery) ||
        item.address.includes(searchQuery) ||
        hasAlias;

      return matchDistrict && matchRisk && matchLevel && matchQuery;
    });
  }, [institutions, selectedDistrict, selectedLevel, selectedRisk, searchQuery]);

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const target = DISTRICT_COORDS[dist] || DISTRICT_COORDS['ALL'];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  const handleInstClick = (inst) => {
    onSelectInst(inst);
    setMapCenter([inst.lat, inst.lng]);
    setMapZoom(15);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '22px', height: 'calc(100vh - 110px)' }}>
      {/* Left Control Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ padding: '18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#2563eb" /> 新北校園地理圖台 ({filteredData.length})
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
              點擊直達校址
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="搜尋新北學校、行政區、路名..."
              className="search-input"
              style={{ width: '100%', paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* School Level Filters */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['ALL', '高中職', '國中', '國小', '幼兒園'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedLevel === lvl ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: selectedLevel === lvl ? '#eff6ff' : '#ffffff',
                  color: selectedLevel === lvl ? '#2563eb' : '#475569',
                  fontSize: '0.74rem',
                  fontWeight: selectedLevel === lvl ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl === 'ALL' ? '全部學制' : lvl}
              </button>
            ))}
          </div>

          {/* New Taipei District Chips */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px', maxHeight: '72px', overflowY: 'auto' }}>
            {Object.keys(DISTRICT_COORDS).map(d => (
              <button
                key={d}
                onClick={() => handleDistrictChange(d)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedDistrict === d ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  background: selectedDistrict === d ? '#eff6ff' : '#ffffff',
                  color: selectedDistrict === d ? '#2563eb' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: selectedDistrict === d ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                {d === 'ALL' ? '全區' : d.replace('區', '')}
              </button>
            ))}
          </div>

          {/* Risk Filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: '全部評等', bg: '#f1f5f9', color: '#334155' },
              { id: '高風險', label: '高風險', bg: '#fff1f2', color: '#be123c' },
              { id: '中風險', label: '中風險', bg: '#fffbeb', color: '#b45309' },
              { id: '低風險', label: '低風險', bg: '#ecfdf5', color: '#047857' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRisk(r.id)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedRisk === r.id ? `1.5px solid ${r.color}` : '1px solid #e2e8f0',
                  background: selectedRisk === r.id ? r.bg : '#ffffff',
                  color: selectedRisk === r.id ? r.color : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Institution List Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filteredData.slice(0, 120).map(item => {
            const isSelected = selectedInst?.id === item.id;
            const rev = item.reviews_data;
            return (
              <div
                key={item.id}
                onClick={() => handleInstClick(item)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', marginBottom: '2px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {item.city} {item.district}・{item.type}
                    </div>
                  </div>
                  <span className={`risk-badge ${item.risk_category === '高風險' ? 'high' : (item.risk_category === '中風險' ? 'medium' : 'low')}`}>
                    {item.total_score} 分
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.74rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {rev && (
                      <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                        <Star size={12} fill="#d97706" /> {rev.google_rating}
                      </span>
                    )}
                    {item.violation_count > 0 && (
                      <span style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}>
                        <AlertTriangle size={12} /> 違規 {item.violation_count}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAudit(item);
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer'
                    }}
                  >
                    卷證
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Leaflet Map */}
      <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* CartoDB Voyager Light Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> Voyager'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController center={mapCenter} zoom={mapZoom} />

          {filteredData.map(item => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCustomPin(item.total_score, item.risk_category)}
              eventHandlers={{
                click: () => onSelectInst(item)
              }}
            >
              <Popup>
                <div style={{ padding: '6px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`risk-badge ${item.risk_category === '高風險' ? 'high' : (item.risk_category === '中風險' ? 'medium' : 'low')}`}>
                      {item.risk_category} ({item.total_score}分)
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#475569', fontWeight: '700' }}>
                      {item.type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '6px' }}>
                    📍 {item.address}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>
                    學生／幼生額度：{item.approved_capacity} 人 ｜ 裁罰：{item.violation_count} 次
                  </p>
                  <button
                    onClick={() => onOpenAudit(item)}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    調閱 5 維查驗卷證 <ChevronRight size={14} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
