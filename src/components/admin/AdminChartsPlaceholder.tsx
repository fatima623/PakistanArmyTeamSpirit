/** Lightweight shell shown while the Recharts bundle loads. */
export function AdminChartsPlaceholder() {
  return (
    <section
      aria-label="Registration analytics"
      className="admin-crm-charts-row admin-fade-in-up admin-fade-in-up--delay-4"
      aria-busy="true"
    >
      <div className="admin-crm-card admin-crm-card--chart admin-crm-card--placeholder">
        <div className="admin-crm-card-header">
          <h2 className="admin-crm-card-title">Registration Activity</h2>
        </div>
        <div className="admin-crm-chart-placeholder" />
      </div>
      <div className="admin-crm-card admin-crm-card--chart admin-crm-card--placeholder">
        <h2 className="admin-crm-card-title admin-crm-card-title--solo">
          Registration Pipeline
        </h2>
        <div className="admin-crm-chart-placeholder admin-crm-chart-placeholder--donut" />
      </div>
    </section>
  );
}
