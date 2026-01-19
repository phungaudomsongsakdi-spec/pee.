import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import WeatherForecast from "./components/WeatherForecast";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("weather");

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />
      
      <header>
        <h1>🧺 ราวตากผ้าอัจฉริยะ</h1>
        <p>Smart Clothes Drying Rack System</p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === "rack" ? "active" : ""}
          onClick={() => setActiveTab("rack")}
        >
          🏠 ควบคุมราวผ้า
        </button>
        <button 
          className={activeTab === "weather" ? "active" : ""}
          onClick={() => setActiveTab("weather")}
        >
          🌤️ พยากรณ์อากาศ
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === "rack" ? (
          <div className="rack-control">
            <h2>แผงควบคุมราวผ้า</h2>
            
            {/* Status Cards */}
            <div className="status-cards">
              <div className="card">
                <h3>💧 ความชื้น</h3>
                <p className="value">65%</p>
              </div>
              <div className="card">
                <h3>🌡️ อุณหภูมิ</h3>
                <p className="value">30°C</p>
              </div>
              <div className="card">
                <h3>👕 สถานะราว</h3>
                <p className="value">กางออก</p>
              </div>
              <div className="card">
                <h3>🌧️ สถานะฝน</h3>
                <p className="value">ไม่ตก</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="control-buttons">
              <button className="btn extend">🔓 กางราวผ้า</button>
              <button className="btn retract">🔒 เก็บราวผ้า</button>
              <button className="btn stop">⏹️ หยุดมอเตอร์</button>
            </div>

            {/* Settings */}
            <div className="settings">
              <h3>⚙️ การตั้งค่า</h3>
              <div>
                <label>ค่าความชื้นเตือน: 80%</label>
                <input type="range" min="0" max="100" defaultValue="80" />
              </div>
            </div>
          </div>
        ) : (
          <WeatherForecast />
        )}
      </div>

      <footer>
        <p>👨‍🎓 นายเกษมสันต์ บัวขาว | 👨‍🎓 นายอนาวิล ผันสืบ | 👩‍🎓 นางสาวภัทราพร ผ่องใส</p>
        <p className="copyright">© 2568 โครงงานราวตากผ้าอัจฉริยะ - แผนกเทคโนโลยีธุรกิจดิจิทัล</p>
      </footer>
    </div>
  );
}

export default App;