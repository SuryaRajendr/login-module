import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import productApi from "../../services/api/productApi";
import * as XLSX from "xlsx";

const TEMPLATE_HEADERS = [
  "SKU",
  "Product Name",
  "Category",
  "Description",
  "Price",
  "Stock Quantity",
  "Unit",
  "Product Image URL",
  "Status",
];

const requiredFields = ["Product Name", "Category", "Price", "Stock Quantity", "Status"];

const slugify = (s) => (s || "").toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const BulkUpload = () => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([] , { header: TEMPLATE_HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "template");
    XLSX.writeFile(wb, "product-upload-template.xlsx");
  };

  const handleFile = (file) => {
    setMessage("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      validateRows(json);
    };
    reader.readAsBinaryString(file);
  };

  const validateRows = (data) => {
    const newErrors = {};
    const seen = new Set();
    const validated = data
      .map((r, idx) => {
        const row = {
          sku: (r["SKU"] || "").toString().trim(),
          name: (r["Product Name"] || "").toString().trim(),
          category: (r["Category"] || "").toString().trim(),
          description: (r["Description"] || "").toString().trim(),
          price: r["Price"] === "" ? null : Number(r["Price"]),
          stock: r["Stock Quantity"] === "" ? null : Number(r["Stock Quantity"]),
          unit: (r["Unit"] || "").toString().trim(),
          image_url: (r["Product Image URL"] || "").toString().trim(),
          status: (r["Status"] || "").toString().trim(),
        };

        const rowErrors = [];
        // required
        requiredFields.forEach((f) => {
          const key = f === "Product Name" ? "name" : f === "Price" ? "price" : f === "Stock Quantity" ? "stock" : f.toLowerCase().replace(/\s+/g, "_");
          if (validatedFieldEmpty(validatedFieldFromKey(row, key))) {
            rowErrors.push(`${f} is required`);
          }
        });

        // price numeric
        if (row.price == null || Number.isNaN(row.price) || row.price < 0) rowErrors.push("Invalid price");
        if (row.stock == null || !Number.isInteger(row.stock) || row.stock < 0) rowErrors.push("Invalid stock quantity");

        // duplicate by sku or name
        const dupKey = (row.sku || slugify(row.name)).toLowerCase();
        if (seen.has(dupKey)) rowErrors.push("Duplicate product in file");
        seen.add(dupKey);

        if (rowErrors.length) newErrors[idx] = rowErrors;

        return { ...row, __rowIndex: idx, __valid: rowErrors.length === 0 };
      })
      .filter((r) => r.name || r.price || r.stock);

    setRows(validated);
    setErrors(newErrors);
  };

  const validatedFieldFromKey = (row, key) => {
    return row[key];
  };

  const validatedFieldEmpty = (v) => {
    return v === null || v === undefined || v === "";
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    handleFile(f);
  };

  const handleImport = async () => {
    setMessage("");
    const validRows = rows.filter((r) => r.__valid);
    if (!validRows.length) {
      setMessage("No valid rows to import.");
      return;
    }

    const payload = {
      products: validRows.map((r) => ({
        sku: r.sku || slugify(r.name),
        name: r.name,
        category: r.category,
        description: r.description,
        price: Number(r.price),
        stock: Number(r.stock),
        unit: r.unit,
        image_url: r.image_url,
        status: r.status,
      })),
    };

    setLoading(true);
    try {
      await productApi.bulkUploadProducts(payload);
      setMessage("Import successful.");
      setRows([]);
      setErrors({});
    } catch (err) {
      setMessage(err.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Bulk Upload</p>
            <h1>Bulk Upload Products</h1>
            <p className="page-description">Download the template, upload an Excel/CSV file, validate, preview and import products in bulk.</p>
          </div>
        </div>

        <div className="table-panel">
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button className="btn-primary" type="button" onClick={downloadTemplate}>Download Sample Template</button>
            <label className="btn-secondary" style={{ padding: 8, cursor: "pointer" }}>
              Choose File
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
            <button className="btn-primary" type="button" onClick={handleImport} disabled={loading}>Import Products</button>
          </div>

          {message && <div style={{ marginBottom: 12 }}>{message}</div>}

          <div className="table-responsive">
            <table className="product-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} style={{ background: r.__valid ? "transparent" : "#fee2e2" }}>
                    <td>{idx + 1}</td>
                    <td>{r.sku || slugify(r.name)}</td>
                    <td>{r.name}</td>
                    <td>{r.category}</td>
                    <td>{r.price}</td>
                    <td>{r.stock}</td>
                    <td>{r.status}</td>
                    <td>{errors[r.__rowIndex] ? errors[r.__rowIndex].join(", ") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkUpload;
