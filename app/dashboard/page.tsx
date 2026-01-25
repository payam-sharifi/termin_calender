"use client";

export default function DashboardPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(120deg, #e0f2fe 0%, #f8fafc 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#0ea5e9'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '1rem', color: '#0ea5e9' }}>در حال بارگذاری...</p>
      </div>
    </div>
  );
}
