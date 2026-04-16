"use client";

export default function DashboardPage() {
  return (
    <div className="termin-loading-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="termin-loading-text" style={{ marginTop: '1rem' }}>در حال بارگذاری...</p>
      </div>
    </div>
  );
}
