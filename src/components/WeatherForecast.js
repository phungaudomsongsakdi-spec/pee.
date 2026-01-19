import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

// ใช้ API Key ของคุณเอง (ได้จาก openweathermap.org)
// หรือใช้ API Key นี้ชั่วคราว (อาจมีจำกัดการใช้งาน)
const API_KEY = "1dc94ac93349cfe32b98b04aba685819";
const CITY = "Ban Pong,TH"; // เปลี่ยนเป็นเมืองของคุณได้

// ข้อมูลสำรองเมื่อโหลดไม่ได้
const FALLBACK_FORECAST = [
  {
    dt_txt: new Date(Date.now() + 86400000).toISOString(),
    weather: [{ icon: "01d", description: "ท้องฟ้าแจ่มใส" }],
    main: { temp: 32, humidity: 65, pressure: 1013 },
    pop: 0.1
  },
  {
    dt_txt: new Date(Date.now() + 172800000).toISOString(),
    weather: [{ icon: "02d", description: "มีเมฆบางส่วน" }],
    main: { temp: 31, humidity: 70, pressure: 1012 },
    pop: 0.3
  },
  {
    dt_txt: new Date(Date.now() + 259200000).toISOString(),
    weather: [{ icon: "10d", description: "ฝนตกเล็กน้อย" }],
    main: { temp: 29, humidity: 80, pressure: 1011 },
    pop: 0.6
  },
  {
    dt_txt: new Date(Date.now() + 345600000).toISOString(),
    weather: [{ icon: "03d", description: "มีเมฆมาก" }],
    main: { temp: 30, humidity: 75, pressure: 1012 },
    pop: 0.4
  },
  {
    dt_txt: new Date(Date.now() + 432000000).toISOString(),
    weather: [{ icon: "01d", description: "ท้องฟ้าแจ่มใส" }],
    main: { temp: 33, humidity: 60, pressure: 1013 },
    pop: 0.2
  }
];

function WeatherForecast() {
  const [forecast, setForecast] = useState(FALLBACK_FORECAST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      // โหลดข้อมูลครั้งแรกอัตโนมัติ
      fetchWeatherData();
    }
  }, []);

  const fetchWeatherData = async () => {
    if (loading) {
      console.log("🔄 กำลังโหลดข้อมูลอยู่แล้ว...");
      return;
    }

    setLoading(true);
    setError(null);
    
    const loadingToast = toast.loading('กำลังโหลดข้อมูลพยากรณ์อากาศ...');
    
    try {
      console.log("🌤️ เริ่มโหลดข้อมูลพยากรณ์อากาศ...");
      
      // ตั้ง timeout 10 วินาที
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // เรียก API OpenWeatherMap
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=th`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.list || data.list.length === 0) {
        throw new Error('ไม่พบข้อมูลพยากรณ์อากาศ');
      }
      
      // เลือกข้อมูลวันละ 1 ครั้ง (ทุก 8 ชั่วโมง = 3 ครั้งต่อวัน)
      const daily = data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
      setUsingFallback(false);
      setLastUpdated(new Date());
      
      console.log("✅ โหลดข้อมูลพยากรณ์อากาศสำเร็จ", daily);
      toast.success('โหลดข้อมูลพยากรณ์อากาศสำเร็จ', { 
        id: loadingToast,
        duration: 2000 
      });
      
    } catch (err) {
      console.error('Weather API error:', err);
      
      // ใช้ข้อมูลสำรองเมื่อโหลดไม่สำเร็จ
      setForecast(FALLBACK_FORECAST);
      setUsingFallback(true);
      
      let errorMessage = 'ไม่สามารถโหลดข้อมูลได้';
      if (err.name === 'AbortError') {
        errorMessage = 'การเชื่อมต่อ timeout ใช้ข้อมูลสำรองแทน';
        toast.error('⏰ โหลดช้าเกินไป ใช้ข้อมูลสำรอง', { 
          id: loadingToast,
          duration: 3000 
        });
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'การเชื่อมต่ออินเทอร์เน็ตมีปัญหา';
        toast.error('📡 การเชื่อมต่อมีปัญหา', { 
          id: loadingToast,
          duration: 3000 
        });
      } else {
        toast.error('❌ โหลดข้อมูลไม่สำเร็จ', { 
          id: loadingToast,
          duration: 3000 
        });
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
    const date = new Date(dateStr);
    if (date.getDate() === new Date().getDate()) {
      return "วันนี้";
    }
    return days[date.getDay()];
  };

  const getThaiDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const handleRetry = () => {
    fetchWeatherData();
  };

  return (
    <div className="weather-forecast">
      <div className="weather-header">
        <h2>🌤️ พยากรณ์อากาศล่วงหน้า 5 วัน</h2>
        <p className="location">📍 {CITY.split(',')[0]}</p>
        
        {usingFallback && (
          <div className="alert fallback-alert">
            <span>📋</span>
            <span>กำลังแสดงข้อมูลพยากรณ์อากาศสำรอง</span>
          </div>
        )}
        
        {error && (
          <div className="alert error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!usingFallback && (
          <div className="alert success-alert">
            <span>✅</span>
            <span>ข้อมูลจริงจาก OpenWeatherMap</span>
          </div>
        )}
      </div>

      {/* ปุ่มโหลดข้อมูล */}
      <div className="weather-controls">
        <button
          onClick={handleRetry}
          disabled={loading}
          className="btn btn-load"
        >
          {loading ? (
            <>
              <div className="spinner-small"></div>
              กำลังโหลด...
            </>
          ) : (
            <>
              🔄 โหลดข้อมูลจริง
            </>
          )}
        </button>
        
        {usingFallback && (
          <div className="info-tip">
            <span>💡</span>
            <span>กดโหลดข้อมูลเพื่ออัปเดตจากอินเทอร์เน็ต</span>
          </div>
        )}
      </div>

      {/* Weather Cards */}
      <div className="weather-grid">
        {forecast.map((day, i) => {
          const rainChance = day.pop ? Math.round(day.pop * 100) : 0;
          const isToday = i === 0;
          
          return (
            <div
              key={i}
              className={`weather-card ${isToday ? 'today' : ''}`}
            >
              <div className="weather-card-header">
                <p className="day-name">{getDayName(day.dt_txt)}</p>
                <p className="date">{getThaiDate(day.dt_txt)}</p>
              </div>

              <div className="weather-icon-container">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  className="weather-icon-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="weather-icon-fallback" style={{display: 'none'}}>
                  {rainChance > 50 ? '🌧️' : rainChance > 30 ? '🌦️' : '☀️'}
                </div>
              </div>

              <p className="weather-description">
                {day.weather[0].description}
              </p>

              <div className="weather-temp">
                <span className="temp-value">{day.main.temp.toFixed(1)}</span>
                <span className="temp-unit">°C</span>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-icon">💧</span>
                  <span className="detail-value">{day.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <span className="detail-value">{day.main.pressure} hPa</span>
                </div>
              </div>

              <div className={`rain-chance ${rainChance > 60 ? 'high' : rainChance > 30 ? 'medium' : 'low'}`}>
                <span className="rain-icon">{rainChance > 30 ? '🌧️' : '☀️'}</span>
                <span className="rain-text">โอกาสฝน {rainChance}%</span>
              </div>

              {usingFallback && (
                <div className="fallback-badge">
                  ⚠️ ข้อมูลสำรอง
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* กราฟ */}
      <div className="weather-graph">
        <h3>📈 แนวโน้มอุณหภูมิและความชื้น</h3>
        <div className="graph-container">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={forecast.map((d) => ({
                name: getDayName(d.dt_txt),
                temp: d.main.temp,
                hum: d.main.humidity,
                date: getThaiDate(d.dt_txt)
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#666' }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "temp") return [`${value}°C`, "อุณหภูมิ"];
                  if (name === "hum") return [`${value}%`, "ความชื้น"];
                  return [value, name];
                }}
                labelFormatter={(label) => `วันที่: ${label}`}
                contentStyle={{ 
                  borderRadius: '10px',
                  border: '1px solid #ddd'
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#43a047"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                name="อุณหภูมิ (°C)"
              />
              <Line
                type="monotone"
                dataKey="hum"
                stroke="#1e88e5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, strokeWidth: 2 }}
                name="ความชื้น (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="weather-footer">
        <div className="update-info">
          <span className="update-label">อัปเดตล่าสุด: </span>
          <span className="update-time">{lastUpdated.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}</span>
        </div>
        <div className="data-source">
          ข้อมูลจาก{" "}
          <a
            href="https://openweathermap.org/"
            className="source-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenWeatherMap.org
          </a>
          {usingFallback && (
            <span className="fallback-note"> (ใช้ข้อมูลสำรอง)</span>
          )}
        </div>
      </div>

      {/* เพิ่ม CSS ใน component */}
      <style jsx>{`
        .weather-forecast {
          padding: 20px;
        }
        
        .weather-header {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .weather-header h2 {
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 1.8rem;
        }
        
        .location {
          color: #718096;
          font-size: 1.1rem;
          margin-bottom: 15px;
        }
        
        .alert {
          padding: 12px 20px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
          font-weight: 500;
        }
        
        .fallback-alert {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }
        
        .error-alert {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .success-alert {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .weather-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .btn-load {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }
        
        .btn-load:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(66, 153, 225, 0.3);
        }
        
        .btn-load:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .info-tip {
          background: #e6f7ff;
          border: 1px solid #91d5ff;
          color: #0050b3;
          padding: 10px 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        
        .weather-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .weather-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: all 0.3s;
          position: relative;
          border: 2px solid transparent;
        }
        
        .weather-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .weather-card.today {
          border-color: #4299e1;
          background: linear-gradient(135deg, #ebf8ff 0%, #fff 100%);
        }
        
        .weather-card-header {
          margin-bottom: 15px;
        }
        
        .day-name {
          font-weight: 700;
          color: #2d3748;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        
        .date {
          color: #718096;
          font-size: 0.9rem;
        }
        
        .weather-icon-container {
          height: 70px;
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .weather-icon-img {
          width: 70px;
          height: 70px;
        }
        
        .weather-icon-fallback {
          font-size: 3rem;
        }
        
        .weather-description {
          color: #4a5568;
          font-size: 0.95rem;
          margin-bottom: 15px;
          text-transform: capitalize;
        }
        
        .weather-temp {
          margin-bottom: 15px;
        }
        
        .temp-value {
          font-size: 2.2rem;
          font-weight: 700;
          color: #2d3748;
        }
        
        .temp-unit {
          font-size: 1.2rem;
          color: #718096;
        }
        
        .weather-details {
          display: flex;
          justify-content: space-around;
          margin-bottom: 15px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        
        .detail-icon {
          font-size: 1.2rem;
        }
        
        .detail-value {
          font-size: 0.9rem;
          color: #4a5568;
        }
        
        .rain-chance {
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }
        
        .rain-chance.high {
          background: #fed7d7;
          color: #c53030;
        }
        
        .rain-chance.medium {
          background: #feebc8;
          color: #c05621;
        }
        
        .rain-chance.low {
          background: #c6f6d5;
          color: #276749;
        }
        
        .fallback-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #fff3cd;
          color: #856404;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .weather-graph {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 25px;
        }
        
        .weather-graph h3 {
          color: #2d3748;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .graph-container {
          margin-top: 20px;
        }
        
        .weather-footer {
          text-align: center;
          padding: 20px;
          background: #f7fafc;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }
        
        .update-info {
          margin-bottom: 10px;
        }
        
        .update-label {
          color: #718096;
        }
        
        .update-time {
          color: #2d3748;
          font-weight: 600;
        }
        
        .data-source {
          color: #718096;
          font-size: 0.9rem;
        }
        
        .source-link {
          color: #4299e1;
          text-decoration: none;
          font-weight: 600;
        }
        
        .source-link:hover {
          text-decoration: underline;
        }
        
        .fallback-note {
          color: #ed8936;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .weather-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .weather-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default WeatherForecast;