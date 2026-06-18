import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import invoiceApi from "../../services/api/invoiceApi";
import { getErrorMessage } from "../../utils/errorParser";

const initialForm = {
  vendor_id: "",
  supplier_id: "",
  product_details: "",
  quantity: 1,
  price: 0,
  tax: 0,
  invoice_date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  status: "Draft",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusTone = (status) => `status-badge invoice-status ${String(status || "").toLowerCase()}`;

const AdminInvoices = () => {
  const { loading, error, run, setError } = useAsync();
  const [formData, setFormData] = useState(initialForm);
  const [invoices, setInvoices] = useState([]);
  const [formMeta, setFormMeta] = useState({ vendors: [], suppliers: [], products: [] });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const totalAmount = useMemo(() => {
    const quantity = Number(formData.quantity || 0);
    const price = Number(formData.price || 0);
    const tax = Number(formData.tax || 0);
    return (quantity * price + tax).toFixed(2);
  }, [formData.quantity, formData.price, formData.tax]);

  const loadPageData = async () => {
    const [formResult, invoiceResult] = await Promise.all([
      run(() => invoiceApi.getInvoiceFormData()),
      run(() => invoiceApi.getInvoices()),
    ]);

    if (formResult.data) {
      setFormMeta(formResult.data);
    }

    if (invoiceResult.data) {
      setInvoices(invoiceResult.data);
      setSelectedInvoice((current) => current || invoiceResult.data[0] || null);
    }

    if (formResult.error) setError(formResult.error);
    if (invoiceResult.error) setError(invoiceResult.error);
  };

  useEffect(() => {
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingInvoiceId(null);
  };

  const handleProductSelect = (productId) => {
    const selectedProduct = formMeta.products.find((product) => String(product.id) === String(productId));
    if (!selectedProduct) return;

    setFormData((current) => ({
      ...current,
      supplier_id: selectedProduct.supplier_id ? String(selectedProduct.supplier_id) : current.supplier_id,
      price: selectedProduct.price,
      product_details: `${selectedProduct.name} - ${selectedProduct.category}`,
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const startEdit = (invoice) => {
    setEditingInvoiceId(invoice.id);
    setFormData({
      vendor_id: String(invoice.vendor_id),
      supplier_id: String(invoice.supplier_id),
      product_details: invoice.product_details,
      quantity: invoice.quantity,
      price: invoice.price,
      tax: invoice.tax,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      status: invoice.status,
    });
  };

  const saveInvoice = async (event) => {
    event.preventDefault();
    const payload = {
      vendor_id: Number(formData.vendor_id),
      supplier_id: Number(formData.supplier_id),
      product_details: formData.product_details,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      tax: Number(formData.tax),
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      status: formData.status,
    };

    const { data, error: saveError } = await run(() =>
      editingInvoiceId ? invoiceApi.updateInvoice(editingInvoiceId, payload) : invoiceApi.createInvoice(payload)
    );

    if (saveError) {
      setError(saveError);
      return;
    }

    if (data) {
      const refreshedInvoices = editingInvoiceId
        ? invoices.map((invoice) => (invoice.id === data.id ? data : invoice))
        : [data, ...invoices];
      setInvoices(refreshedInvoices);
      setSelectedInvoice(data);
      resetForm();
    }
  };

  const downloadInvoicePdf = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 14, 18);
    doc.setFontSize(11);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 14, 30);
    doc.text(`Vendor Name: ${invoice.vendor_name}`, 14, 38);
    doc.text(`Supplier Name: ${invoice.supplier_name}`, 14, 46);
    doc.text(`Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 14, 54);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 14, 62);
    doc.text(`Status: ${invoice.status}`, 14, 70);
    doc.text(`Product Details: ${invoice.product_details}`, 14, 84, { maxWidth: 180 });
    doc.text(`Quantity: ${invoice.quantity}`, 14, 104);
    doc.text(`Price: ${money.format(invoice.price)}`, 14, 112);
    doc.text(`Tax: ${money.format(invoice.tax)}`, 14, 120);
    doc.text(`Total Amount: ${money.format(invoice.total_amount)}`, 14, 128);
    doc.save(`${invoice.invoice_number}.pdf`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Invoices</p>
            <h1>Invoice creation and tracking</h1>
            <p className="page-description">
              Create invoices, review invoice history, and download printable PDF copies from a single admin view.
            </p>
          </div>
        </div>

        {loading && invoices.length === 0 ? (
          <div className="dashboard-card">Loading invoice workspace...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : (
          <>
            <div className="invoice-grid">
              <div className="dashboard-section invoice-form-panel">
                <div className="section-header">
                  <div>
                    <h2>{editingInvoiceId ? "Update invoice" : "Create invoice"}</h2>
                    <p>Use live API data to create a finance record tied to vendors and suppliers.</p>
                  </div>
                  {editingInvoiceId ? (
                    <button className="btn-secondary inline-btn" type="button" onClick={resetForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>

                <form className="invoice-form" onSubmit={saveInvoice}>
                  <div className="invoice-field-grid">
                    <label>
                      Vendor Name
                      <select value={formData.vendor_id} onChange={(event) => handleFieldChange("vendor_id", event.target.value)} required>
                        <option value="">Select vendor</option>
                        {formMeta.vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Supplier Name
                      <select value={formData.supplier_id} onChange={(event) => handleFieldChange("supplier_id", event.target.value)} required>
                        <option value="">Select supplier</option>
                        {formMeta.suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Product
                      <select onChange={(event) => handleProductSelect(event.target.value)}>
                        <option value="">Pick a product</option>
                        {formMeta.products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.category})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Quantity
                      <input type="number" min="1" value={formData.quantity} onChange={(event) => handleFieldChange("quantity", event.target.value)} required />
                    </label>
                    <label>
                      Price
                      <input type="number" min="0" step="0.01" value={formData.price} onChange={(event) => handleFieldChange("price", event.target.value)} required />
                    </label>
                    <label>
                      Tax
                      <input type="number" min="0" step="0.01" value={formData.tax} onChange={(event) => handleFieldChange("tax", event.target.value)} />
                    </label>
                    <label>
                      Invoice Date
                      <input type="date" value={formData.invoice_date} onChange={(event) => handleFieldChange("invoice_date", event.target.value)} required />
                    </label>
                    <label>
                      Due Date
                      <input type="date" value={formData.due_date} onChange={(event) => handleFieldChange("due_date", event.target.value)} required />
                    </label>
                    <label>
                      Status
                      <select value={formData.status} onChange={(event) => handleFieldChange("status", event.target.value)}>
                        {[
                          "Draft",
                          "Sent",
                          "Paid",
                          "Pending",
                          "Overdue",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="full-width">
                      Product Details
                      <textarea
                        rows="4"
                        value={formData.product_details}
                        onChange={(event) => handleFieldChange("product_details", event.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <div className="invoice-form-footer">
                    <div>
                      <p className="mini-label">Calculated total amount</p>
                      <strong>{money.format(Number(totalAmount))}</strong>
                    </div>
                    <div className="invoice-form-actions">
                      <button className="btn-secondary inline-btn" type="button" onClick={resetForm}>
                        Reset
                      </button>
                      <button className="btn-primary inline-btn" type="submit">
                        {editingInvoiceId ? "Update invoice" : "Create invoice"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="dashboard-section invoice-detail-panel">
                <div className="section-header">
                  <div>
                    <h2>Invoice detail</h2>
                    <p>Review the currently selected invoice before downloading or editing it.</p>
                  </div>
                </div>

                {selectedInvoice ? (
                  <div className="invoice-detail-card">
                    <div className="invoice-detail-top">
                      <div>
                        <p className="eyebrow">{selectedInvoice.invoice_number}</p>
                        <h3>{selectedInvoice.product_details}</h3>
                      </div>
                      <span className={statusTone(selectedInvoice.status)}>{selectedInvoice.status}</span>
                    </div>

                    <div className="invoice-detail-meta">
                      <div>
                        <span>Vendor</span>
                        <strong>{selectedInvoice.vendor_name}</strong>
                      </div>
                      <div>
                        <span>Supplier</span>
                        <strong>{selectedInvoice.supplier_name}</strong>
                      </div>
                      <div>
                        <span>Quantity</span>
                        <strong>{selectedInvoice.quantity}</strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>{money.format(selectedInvoice.total_amount)}</strong>
                      </div>
                    </div>

                    <div className="invoice-detail-meta invoice-detail-meta-sm">
                      <div>
                        <span>Invoice date</span>
                        <strong>{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span>Due date</span>
                        <strong>{new Date(selectedInvoice.due_date).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span>Payment status</span>
                        <strong>{selectedInvoice.payment_status || "Pending"}</strong>
                      </div>
                    </div>

                    <p className="invoice-detail-copy">{selectedInvoice.product_details}</p>

                    <div className="invoice-form-actions">
                      <button className="btn-secondary inline-btn" type="button" onClick={() => startEdit(selectedInvoice)}>
                        Edit invoice
                      </button>
                      <button className="btn-primary inline-btn" type="button" onClick={() => downloadInvoicePdf(selectedInvoice)}>
                        Download PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="invoice-empty-state">No invoice selected.</div>
                )}
              </div>
            </div>

            <div className="dashboard-section invoice-list-panel">
              <div className="section-header">
                <div>
                  <h2>Invoice list</h2>
                  <p>Newest invoices appear first and can be viewed, edited, or exported in PDF format.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="product-table invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Vendor</th>
                      <th>Supplier</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoice_number}</td>
                        <td>{invoice.vendor_name}</td>
                        <td>{invoice.supplier_name}</td>
                        <td>{money.format(invoice.total_amount)}</td>
                        <td><span className={statusTone(invoice.status)}>{invoice.status}</span></td>
                        <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions invoice-actions">
                            <button type="button" className="inline-btn" onClick={() => setSelectedInvoice(invoice)}>
                              View
                            </button>
                            <button type="button" className="inline-btn" onClick={() => startEdit(invoice)}>
                              Edit
                            </button>
                            <button type="button" className="inline-btn" onClick={() => downloadInvoicePdf(invoice)}>
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInvoices;