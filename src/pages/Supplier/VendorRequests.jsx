import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import supplierApi from "../../services/api/supplierApi";
import { getErrorMessage } from "../../utils/errorParser";

const VendorRequests = () => {
  const { loading, error, run, setError } = useAsync();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      const { data, error: loadError } = await run(supplierApi.getVendorRequests);
      if (data) {
        setRequests(data);
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadRequests();
  }, [run, setError]);

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

        {loading ? (
          <div className="dashboard-card">Loading vendor requests...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : requests.length === 0 ? (
          <div className="dashboard-card">No vendor requests found.</div>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.vendor_name}</h3>
                <p>{`Product: ${request.product_name}`}</p>
                <p>{`Quantity: ${request.quantity}`}</p>
                {request.message && <p>{request.message}</p>}
                <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorRequests;
