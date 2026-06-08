const SummaryCard = ({ title, value, description, icon, color }) => {
  return (
    <div className="summary-card">
      <div className="summary-card-top">
        <span className="summary-card-icon" style={{ backgroundColor: color }}>
          {icon}
        </span>
        <div className="summary-card-title">{title}</div>
      </div>

      <div className="summary-card-value">{value}</div>
      <p className="summary-card-note">{description}</p>
    </div>
  );
};

export default SummaryCard;
