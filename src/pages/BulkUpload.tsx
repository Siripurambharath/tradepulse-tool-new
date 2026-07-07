import React, { useState, useRef } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

interface DuplicateEntry {
  product: string;
  company_name: string;
  contact_numbers: string;
  emails: string;
  message: string;
}

interface SchemaMismatch {
  message: string;
  missingColumns: string[];
  extraColumns: string[];
}

const BuyerBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [duplicates, setDuplicates] = useState<DuplicateEntry[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [schemaMismatch, setSchemaMismatch] = useState<SchemaMismatch | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ============================
     FILE CHANGE
  ============================ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage("");
      setMessageType("");
      setDuplicates([]);
      setShowDuplicates(false);
      setSchemaMismatch(null);
    } else {
      setFile(null);
    }
  };

  /* ============================
     CLEAR / RESET FORM
  ============================ */
  const resetForm = () => {
    setFile(null);
    setMessage("");
    setMessageType("");
    setDuplicates([]);
    setShowDuplicates(false);
    setSchemaMismatch(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ============================
     DOWNLOAD TEMPLATE
  ============================ */
  const downloadTemplate = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/buyers/bulk/download-template`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "buyer_bulk_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("❌ Template download failed");
      setMessageType("error");
    }
  };

  /* ============================
     UPLOAD EXCEL
  ============================ */
  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select an Excel file");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      setDuplicates([]);
      setShowDuplicates(false);
      setSchemaMismatch(null);

      const res = await axios.post(
        `${BASE_URL}/api/buyers/bulk-upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Check for schema mismatch response
      if (res.data.schemaMismatch) {
        setSchemaMismatch({
          message: res.data.message || "Schema mismatch detected",
          missingColumns: res.data.missingColumns || [],
          extraColumns: res.data.extraColumns || []
        });
        setMessage(`❌ ${res.data.message || "Schema mismatch detected"}`);
        setMessageType("error");
        return;
      }

      const insertedCount = res.data.inserted || 0;
      const skippedCount = res.data.skipped || 0;
      const duplicateEntries = res.data.duplicates || [];
      
      // Set duplicates for display
      if (duplicateEntries.length > 0) {
        setDuplicates(duplicateEntries);
      }

      // Build success message
      let successMessage = `✅ ${insertedCount} buyers uploaded successfully!`;
      
      if (skippedCount > 0) {
        successMessage += ` (${skippedCount} rows skipped)`;
      }
      
      if (duplicateEntries.length > 0) {
        successMessage += ` ${duplicateEntries.length} duplicate(s) found and skipped. Click "View Duplicates" to see details.`;
        setMessage(successMessage);
        setMessageType("success");
      } else {
        setMessage(successMessage);
        setMessageType("success");
        // Reset form only if no duplicates found
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
      
    } catch (err: any) {
      // Check if it's a schema mismatch error from backend
      if (err.response?.data?.schemaMismatch) {
        const errorData = err.response.data;
        setSchemaMismatch({
          message: errorData.message || "Schema mismatch detected",
          missingColumns: errorData.missingColumns || [],
          extraColumns: errorData.extraColumns || []
        });
        setMessage(`❌ ${errorData.message || "Schema mismatch detected"}`);
        setMessageType("error");
      } else {
        const errorMsg = err.response?.data?.message || "Upload failed";
        setMessage(`❌ ${errorMsg}`);
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🌍 Buyers Bulk Upload
        </h1>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Download the Excel template using the button below</li>
              <li>Fill in the buyer details in the template</li>
              <li>Upload the filled Excel file</li>
              <li>Multiple contacts and emails can be added (comma-separated)</li>
              <li><strong>Duplicate Prevention:</strong> Records with same product, company name, and matching contact/email will be skipped</li>
              <li><strong>Important:</strong> The Excel file must have the exact same column headers as the template</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📥 Download Excel Template
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Download the template to get started
            </p>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-700 mb-4">📤 Upload Excel File</h3>
              
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />

              {file && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-sm text-green-600">
                    ✅ Selected: {file.name}
                  </span>
                  <button
                    onClick={resetForm}
                    className="text-sm text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`mt-4 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  loading || !file
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "🚀 Upload Buyers"
                )}
              </button>

              {/* Upload Another Button - shown after successful upload */}
              {messageType === "success" && duplicates.length === 0 && (
                <button
                  onClick={resetForm}
                  className="mt-3 ml-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  🔄 Upload Another
                </button>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg font-medium flex items-center justify-between ${
                messageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              <span>{message}</span>
              <div className="flex items-center gap-2">
                {messageType === "success" && duplicates.length > 0 && (
                  <button
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className="text-sm text-green-700 hover:text-green-900 font-medium underline"
                  >
                    {showDuplicates ? "Hide Duplicates" : "View Duplicates"}
                  </button>
                )}
                {messageType === "success" && duplicates.length === 0 && (
                  <button
                    onClick={resetForm}
                    className="text-sm text-green-700 hover:text-green-900 font-medium underline"
                  >
                    Clear
                  </button>
                )}
                {(messageType === "error" || schemaMismatch) && (
                  <button
                    onClick={() => {
                      setMessage("");
                      setMessageType("");
                      setSchemaMismatch(null);
                    }}
                    className="text-sm text-red-700 hover:text-red-900 font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Schema Mismatch Details */}
          {schemaMismatch && (
            <div className="mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">
                  ⚠️ Schema Mismatch Detected
                </h4>
                <div className="space-y-4">
                  {schemaMismatch.missingColumns.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700">Missing Columns:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schemaMismatch.missingColumns.map((col, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            {col}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        Please add these columns to your Excel file.
                      </p>
                    </div>
                  )}
                  {schemaMismatch.extraColumns.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700">Extra Columns:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schemaMismatch.extraColumns.map((col, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            {col}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        Please remove these columns from your Excel file.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSchemaMismatch(null);
                    setMessage("");
                    setMessageType("");
                  }}
                  className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Duplicates Display */}
          {showDuplicates && duplicates.length > 0 && (
            <div className="mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">
                  ⚠️ Duplicate Entries Skipped ({duplicates.length})
                </h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-yellow-800">Product</th>
                        <th className="px-3 py-2 text-left text-yellow-800">Company</th>
                        <th className="px-3 py-2 text-left text-yellow-800">Contacts</th>
                        <th className="px-3 py-2 text-left text-yellow-800">Emails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-200">
                      {duplicates.map((dup, index) => (
                        <tr key={index} className="hover:bg-yellow-50">
                          <td className="px-3 py-2 text-yellow-800">{dup.product}</td>
                          <td className="px-3 py-2 text-yellow-800">{dup.company_name}</td>
                          <td className="px-3 py-2 text-yellow-800 text-xs">{dup.contact_numbers}</td>
                          <td className="px-3 py-2 text-yellow-800 text-xs">{dup.emails}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => setShowDuplicates(false)}
                  className="mt-3 text-sm text-yellow-700 hover:text-yellow-900 font-medium underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerBulkUpload;