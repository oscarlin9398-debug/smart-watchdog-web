import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Star, AlertTriangle, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// 1. 修復 Leaflet 預設圖標路徑
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 2. 效能優化：圖標快取 (避免每次 Render 重新建立 489 個 DOM 實例)
const pinIconCache = {};
const getCustomPin = (score, risk) => {
  const key = `${score}_${risk}`;
  if (!pinIconCache[key]) {
    const pinClass = risk === '高風險' ? 'high' : (risk === '中風險' ? 'medium' : 'low');
    pinIconCache[key] = L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div class="custom-pin ${pinClass}">${score}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16]
    });
  }
  return pinIconCache[key];
};

// 3. 修復：受控地圖視角 (必須在 useEffect 內執行，避免中斷瓦片載入)
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// 4. 修復：自動修復灰畫面 (強制喚醒 Leaflet 容器尺寸重算)
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
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
  const [selectedLevel, setSelectedLevel] = useState('ALL');
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

  // 5. 效能優化：限制地圖標記數量，防止 489 個點位卡死瀏覽器
  const displayMarkers = useMemo(() => {
    const valid = filteredData.filter(i => i.lat && i.lng && !isNaN(i.lat) && !isNaN(i.lng));
    if (selectedDistrict === 'ALL' && !searchQuery.trim() && valid.length > 120) {
      const high = valid.filter(i => i.risk_category === '高風險');
      const medium = valid.filter(i => i.risk_category === '中風險');
      const low = valid.filter(i => i.risk_category === '低風險');
      return [...high, ...medium, ...low].slice(0, 120);
    }
    return valid;
  }, [filteredData, selectedDistrict, searchQuery]);

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const target = DISTRICT_COORDS[dist] || DISTRICT_COORDS['ALL'];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  const handleInstClick = (inst) => {
    onSelectInst(inst);
    if (inst.lat && inst.lng) {
      setMapCenter([inst.lat, inst.lng]);
      setMapZoom(15);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', height: 'calc(100vh - 110px)' }}>
      {/* 左側列表控制台 */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#2563eb" /> 新北校園地理監控 ({filteredData.length})
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
              點擊可定位
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="搜尋新北學校、行政區、路名..."
              className="search-input"
              style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* 學制快篩 */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
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
                  fontSize: '0.72rem',
                  fontWeight: selectedLevel === lvl ? '800' : '600',
                  cursor: 'pointer'
                }}
              >
                {lvl === 'ALL' ? '全部' : lvl}
              </button>
            ))}
          </div>

          {/* 行政區快選 */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px', maxHeight: '68px', overflowY: 'auto' }}>
            {Object.keys(DISTRICT_COORDS).map(d => (
              <button
                key={d}
                onClick={() => handleDistrictChange(d)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedDistrict === d ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  background: selectedDistrict === d ? '#eff6ff' : '#ffffff',
                  color: selectedDistrict === d ? '#2563eb' : '#475569',
                  fontSize: '0.7rem',
                  fontWeight: selectedDistrict === d ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                {d === 'ALL' ? '全區' : d.replace('區', '')}
              </button>
            ))}
          </div>

          {/* 風險等級快篩 */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: '全等級', bg: '#f1f5f9', color: '#334155' },
              { id: '高風險', label: '高風險', bg: '#fff1f2', color: '#be123c' },
              { id: '中風險', label: '中風險', bg: '#fffbeb', color: '#b45309' },
              { id: '低風險', label: '低風險', bg: '#ecfdf5', color: '#047857' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRisk(r.id)}
                style={{
                  flex: 1,
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedRisk === r.id ? `1.5px solid ${r.color}` : '1px solid #e2e8f0',
                  background: selectedRisk === r.id ? r.bg : '#ffffff',
                  color: selectedRisk === r.id ? r.color : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 左側滾動清單 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {filteredData.slice(0, 100).map(item => {
            const isSelected = selectedInst?.id === item.id;
            const rev = item.reviews_data;
            return (
              <div
                key={item.id}
                onClick={() => handleInstClick(item)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a', marginBottom: '2px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {item.district}・{item.type}
                    </div>
                  </div>
                  <span className={`risk-badge ${item.risk_category === '高風險' ? 'high' : (item.risk_category === '中風險' ? 'medium' : 'low')}`}>
                    {item.total_score} 分
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {rev && (
                      <span style={{ color: '#d97006', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                        <Star size={11} fill="#d97006" /> {rev.google_rating}
                      </span>
                    )}
                    {item.violation_count > 0 && (
                      <span style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}>
                        <AlertTriangle size={11} /> 違規 {item.violation_count}
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
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer'
                    }}
                  >
                    查核
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右側流暢 Leaflet 地圖 */}
      <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', position: 'relative', background: '#f8fafc', minHeight: '500px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {/* 使用標準穩定的 OpenStreetMap 圖資 (速度最快、不再灰畫面) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          <MapResizer />

          {displayMarkers.map(item => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={getCustomPin(item.total_score, item.risk_category)}
              eventHandlers={{
                click: () => onSelectInst(item)
              }}
            >
              <Popup>
                <div style={{ padding: '4px', minWidth: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`risk-badge ${item.risk_category === '高風險' ? 'high' : (item.risk_category === '中風險' ? 'medium' : 'low')}`}>
                      {item.risk_category} ({item.total_score}分)
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '1px 5px', background: '#f1f5f9', borderRadius: '4px', color: '#475569', fontWeight: '700' }}>
                      {item.type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '6px' }}>
                    📍 {item.address}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
                    容量：{item.approved_capacity} 人 ｜ 裁處：{item.violation_count} 次
                  </p>
                  <button
                    onClick={() => onOpenAudit(item)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    調閱 5 維度查核報告 <ChevronRight size={13} />
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

