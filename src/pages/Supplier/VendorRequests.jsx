import DashboardLayout from "../../layouts/DashboardLayout";

const VendorRequests = () => {
  const requests = [
    { id: 1, vendor: "FreshMart", request: "Request for 100 units of Mango Juice", status: "Pending" },
    { id: 2, vendor: "GreenFoods", request: "Need 30 bags of Wheat Flour", status: "Approved" },
    { id: 3, vendor: "SpiceHouse", request: "Require 50 packs of Mixed Spice", status: "Pending" },
  ];

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Vendor Requests</p>
            <h1>Request queue</h1>
            <p className="page-description">
              Track recent vendor requests, review order details, and take action quickly.
            </p>
          </div>
        </div>

        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <h3>{request.vendor}</h3>
              <p>{request.request}</p>
              <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorRequests;
