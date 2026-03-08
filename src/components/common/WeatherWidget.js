import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const WeatherIcon = ({ icon, size = 48 }) => {
  return <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="weather" style={{ width: size, height: size }} />;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await api.get('/weather');
        setWeather(data.data);
      } catch (err) {
        console.error('Hava durumu yüklenemedi:', err);
      }
      setLoading(false);
    };
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (!weather || weather.error) {
    return null;
  }

  const { current, forecast, city } = weather;

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-orange)', fontSize: 14 }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{city}</span>
        </div>
        <button 
          onClick={() => setShowForecast(!showForecast)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--accent-orange)', 
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-heading)',
            fontWeight: 600
          }}
        >
          {showForecast ? 'Gizle' : '5 Günlük Tahmin →'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <WeatherIcon icon={current.icon} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {current.temp}°C
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: -4 }}>
            {current.description}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Hissedilen: {current.feelsLike}°C
          </div>
        </div>
        <div style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <div><i className="fas fa-wind" style={{ width: 16, marginRight: 4 }} />{current.windSpeed} km/s</div>
          <div><i className="fas fa-tint" style={{ width: 16, marginRight: 4 }} />%{current.humidity}</div>
          <div><i className="fas fa-eye" style={{ width: 16, marginRight: 4 }} />{current.visibility} km</div>
        </div>
      </div>

      {showForecast && forecast && forecast.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {forecast.map((day, i) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
              return (
                <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {dayName}
                  </div>
                  <WeatherIcon icon={day.icon} size={32} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {day.temp}°
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {day.tempMin}° / {day.tempMax}°
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
        <i className="fas fa-sun" style={{ marginRight: 4 }} />{current.sunrise} - {current.sunset}
      </div>
    </div>
  );
}
