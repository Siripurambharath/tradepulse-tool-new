// import React, { useState, useRef } from "react";
// import axios from "axios";

// const BASE_URL = "http://localhost:5000";

// interface DuplicateEntry {
//   product: string;
//   company_name: string;
//   contact_numbers: string;
//   emails: string;
//   message: string;
// }

// interface SchemaMismatch {
//   message: string;
//   missingColumns: string[];
//   extraColumns: string[];
// }

// const BuyerBulkUpload: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState<"success" | "error" | "">("");
//   const [duplicates, setDuplicates] = useState<DuplicateEntry[]>([]);
//   const [showDuplicates, setShowDuplicates] = useState(false);
//   const [schemaMismatch, setSchemaMismatch] = useState<SchemaMismatch | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   /* ============================
//      FILE CHANGE
//   ============================ */
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//       setMessage("");
//       setMessageType("");
//       setDuplicates([]);
//       setShowDuplicates(false);
//       setSchemaMismatch(null);
//     } else {
//       setFile(null);
//     }
//   };

//   /* ============================
//      CLEAR / RESET FORM
//   ============================ */
//   const resetForm = () => {
//     setFile(null);
//     setMessage("");
//     setMessageType("");
//     setDuplicates([]);
//     setShowDuplicates(false);
//     setSchemaMismatch(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   /* ============================
//      DOWNLOAD TEMPLATE
//   ============================ */
//   const downloadTemplate = async () => {
//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/buyers/bulk/download-template`,
//         { responseType: "blob" }
//       );

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "buyer_bulk_template.xlsx");
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       setMessage("❌ Template download failed");
//       setMessageType("error");
//     }
//   };

//   /* ============================
//      UPLOAD EXCEL
//   ============================ */
//   const handleUpload = async () => {
//     if (!file) {
//       setMessage("❌ Please select an Excel file");
//       setMessageType("error");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("excelFile", file);

//     try {
//       setLoading(true);
//       setMessage("");
//       setMessageType("");
//       setDuplicates([]);
//       setShowDuplicates(false);
//       setSchemaMismatch(null);

//       const res = await axios.post(
//         `${BASE_URL}/api/buyers/bulk-upload`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       // Check for schema mismatch response
//       if (res.data.schemaMismatch) {
//         setSchemaMismatch({
//           message: res.data.message || "Schema mismatch detected",
//           missingColumns: res.data.missingColumns || [],
//           extraColumns: res.data.extraColumns || []
//         });
//         setMessage(`❌ ${res.data.message || "Schema mismatch detected"}`);
//         setMessageType("error");
//         return;
//       }

//       const insertedCount = res.data.inserted || 0;
//       const skippedCount = res.data.skipped || 0;
//       const duplicateEntries = res.data.duplicates || [];
      
//       // Set duplicates for display
//       if (duplicateEntries.length > 0) {
//         setDuplicates(duplicateEntries);
//       }

//       // Build success message
//       let successMessage = `✅ ${insertedCount} buyers uploaded successfully!`;
      
//       if (skippedCount > 0) {
//         successMessage += ` (${skippedCount} rows skipped)`;
//       }
      
//       if (duplicateEntries.length > 0) {
//         successMessage += ` ${duplicateEntries.length} duplicate(s) found and skipped. Click "View Duplicates" to see details.`;
//         setMessage(successMessage);
//         setMessageType("success");
//       } else {
//         setMessage(successMessage);
//         setMessageType("success");
//         // Reset form only if no duplicates found
//         setTimeout(() => {
//           resetForm();
//         }, 2000);
//       }
      
//     } catch (err: any) {
//       // Check if it's a schema mismatch error from backend
//       if (err.response?.data?.schemaMismatch) {
//         const errorData = err.response.data;
//         setSchemaMismatch({
//           message: errorData.message || "Schema mismatch detected",
//           missingColumns: errorData.missingColumns || [],
//           extraColumns: errorData.extraColumns || []
//         });
//         setMessage(`❌ ${errorData.message || "Schema mismatch detected"}`);
//         setMessageType("error");
//       } else {
//         const errorMsg = err.response?.data?.message || "Upload failed";
//         setMessage(`❌ ${errorMsg}`);
//         setMessageType("error");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ============================
//      RENDER
//   ============================ */
//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white shadow-lg rounded-xl p-8">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
//           🌍 Buyers Bulk Upload
//         </h1>

//         <div className="space-y-6">
//           {/* Instructions */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
//             <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
//               <li>Download the Excel template using the button below</li>
//               <li>Fill in the buyer details in the template</li>
//               <li>Upload the filled Excel file</li>
//               <li>Multiple contacts and emails can be added (comma-separated)</li>
//               <li><strong>Duplicate Prevention:</strong> Records with same product, company name, and matching contact/email will be skipped</li>
//               <li><strong>Important:</strong> The Excel file must have the exact same column headers as the template</li>
//             </ul>
//           </div>

//           {/* Download Template */}
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//             <button
//               onClick={downloadTemplate}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
//             >
//               📥 Download Excel Template
//             </button>
//             <p className="text-sm text-gray-500 mt-2">
//               Download the template to get started
//             </p>
//           </div>

//           {/* Upload Section */}
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//             <div className="text-center">
//               <h3 className="font-semibold text-gray-700 mb-4">📤 Upload Excel File</h3>
              
//               <input
//                 ref={fileInputRef}
//                 id="fileInput"
//                 type="file"
//                 accept=".xlsx,.xls"
//                 onChange={handleFileChange}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
//               />

//               {file && (
//                 <div className="mt-3 flex items-center justify-center gap-2">
//                   <span className="text-sm text-green-600">
//                     ✅ Selected: {file.name}
//                   </span>
//                   <button
//                     onClick={resetForm}
//                     className="text-sm text-red-500 hover:text-red-700 hover:underline"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               )}

//               <button
//                 onClick={handleUpload}
//                 disabled={!file || loading}
//                 className={`mt-4 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
//                   loading || !file
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Uploading...
//                   </span>
//                 ) : (
//                   "🚀 Upload Buyers"
//                 )}
//               </button>

//               {/* Upload Another Button - shown after successful upload */}
//               {messageType === "success" && duplicates.length === 0 && (
//                 <button
//                   onClick={resetForm}
//                   className="mt-3 ml-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
//                 >
//                   🔄 Upload Another
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Message Display */}
//           {message && (
//             <div
//               className={`p-4 rounded-lg font-medium flex items-center justify-between ${
//                 messageType === "success"
//                   ? "bg-green-100 text-green-700 border border-green-200"
//                   : "bg-red-100 text-red-700 border border-red-200"
//               }`}
//             >
//               <span>{message}</span>
//               <div className="flex items-center gap-2">
//                 {messageType === "success" && duplicates.length > 0 && (
//                   <button
//                     onClick={() => setShowDuplicates(!showDuplicates)}
//                     className="text-sm text-green-700 hover:text-green-900 font-medium underline"
//                   >
//                     {showDuplicates ? "Hide Duplicates" : "View Duplicates"}
//                   </button>
//                 )}
//                 {messageType === "success" && duplicates.length === 0 && (
//                   <button
//                     onClick={resetForm}
//                     className="text-sm text-green-700 hover:text-green-900 font-medium underline"
//                   >
//                     Clear
//                   </button>
//                 )}
//                 {(messageType === "error" || schemaMismatch) && (
//                   <button
//                     onClick={() => {
//                       setMessage("");
//                       setMessageType("");
//                       setSchemaMismatch(null);
//                     }}
//                     className="text-sm text-red-700 hover:text-red-900 font-medium"
//                   >
//                     ✕
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Schema Mismatch Details */}
//           {schemaMismatch && (
//             <div className="mt-4">
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-red-800 mb-3">
//                   ⚠️ Schema Mismatch Detected
//                 </h4>
//                 <div className="space-y-4">
//                   {schemaMismatch.missingColumns.length > 0 && (
//                     <div>
//                       <p className="font-medium text-red-700">Missing Columns:</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {schemaMismatch.missingColumns.map((col, index) => (
//                           <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
//                             {col}
//                           </span>
//                         ))}
//                       </div>
//                       <p className="text-sm text-red-600 mt-1">
//                         Please add these columns to your Excel file.
//                       </p>
//                     </div>
//                   )}
//                   {schemaMismatch.extraColumns.length > 0 && (
//                     <div>
//                       <p className="font-medium text-red-700">Extra Columns:</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {schemaMismatch.extraColumns.map((col, index) => (
//                           <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
//                             {col}
//                           </span>
//                         ))}
//                       </div>
//                       <p className="text-sm text-red-600 mt-1">
//                         Please remove these columns from your Excel file.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => {
//                     setSchemaMismatch(null);
//                     setMessage("");
//                     setMessageType("");
//                   }}
//                   className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium underline"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Duplicates Display */}
//           {showDuplicates && duplicates.length > 0 && (
//             <div className="mt-4">
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-yellow-800 mb-3">
//                   ⚠️ Duplicate Entries Skipped ({duplicates.length})
//                 </h4>
//                 <div className="max-h-60 overflow-y-auto">
//                   <table className="min-w-full text-sm">
//                     <thead className="bg-yellow-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left text-yellow-800">Product</th>
//                         <th className="px-3 py-2 text-left text-yellow-800">Company</th>
//                         <th className="px-3 py-2 text-left text-yellow-800">Contacts</th>
//                         <th className="px-3 py-2 text-left text-yellow-800">Emails</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-yellow-200">
//                       {duplicates.map((dup, index) => (
//                         <tr key={index} className="hover:bg-yellow-50">
//                           <td className="px-3 py-2 text-yellow-800">{dup.product}</td>
//                           <td className="px-3 py-2 text-yellow-800">{dup.company_name}</td>
//                           <td className="px-3 py-2 text-yellow-800 text-xs">{dup.contact_numbers}</td>
//                           <td className="px-3 py-2 text-yellow-800 text-xs">{dup.emails}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 <button
//                   onClick={() => setShowDuplicates(false)}
//                   className="mt-3 text-sm text-yellow-700 hover:text-yellow-900 font-medium underline"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuyerBulkUpload;





import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Users,
  Mail,
  Phone,
  Building2,
  Package,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart3,
  ArrowUpRight,
  Shield,
  Zap
} from "lucide-react";
import { API_URL, ACTIVITY_URL } from '@/components/api';

const BASE_URL = API_URL;

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

interface UploadStats {
  inserted: number;
  skipped: number;
  duplicates: number;
  totalRows: number;
}

const BuyerBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");
  const [duplicates, setDuplicates] = useState<DuplicateEntry[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [schemaMismatch, setSchemaMismatch] = useState<SchemaMismatch | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ============================
     FILE CHANGE
  ============================ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setMessage("❌ Please select a valid Excel file (.xlsx or .xls)");
        setMessageType("error");
        return;
      }
      setFile(selectedFile);
      setMessage("");
      setMessageType("");
      setDuplicates([]);
      setShowDuplicates(false);
      setSchemaMismatch(null);
      setUploadStats(null);
    } else {
      setFile(null);
    }
  };

  /* ============================
     DRAG & DROP HANDLERS
  ============================ */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(droppedFile.type) && !droppedFile.name.match(/\.(xlsx|xls)$/)) {
        setMessage("❌ Please drop a valid Excel file (.xlsx or .xls)");
        setMessageType("error");
        return;
      }
      setFile(droppedFile);
      setMessage("");
      setMessageType("");
      setDuplicates([]);
      setShowDuplicates(false);
      setSchemaMismatch(null);
      setUploadStats(null);
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
    setUploadStats(null);
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
      
      setMessage("✅ Template downloaded successfully!");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch {
      setMessage("❌ Template download failed. Please try again.");
      setMessageType("error");
    }
  };

  /* ============================
     UPLOAD EXCEL
  ============================ */
  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select an Excel file to upload");
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
      setUploadStats(null);

      const res = await axios.post(
        `${BASE_URL}/api/buyers/bulk-upload`,
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000
        }
      );

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
      const totalRows = res.data.totalRows || insertedCount + skippedCount + duplicateEntries.length;
      
      setUploadStats({
        inserted: insertedCount,
        skipped: skippedCount,
        duplicates: duplicateEntries.length,
        totalRows: totalRows
      });
      
      if (duplicateEntries.length > 0) {
        setDuplicates(duplicateEntries);
      }

      let successMessage = "";
      if (insertedCount > 0) {
        successMessage = `✅ Successfully uploaded ${insertedCount} buyer${insertedCount > 1 ? 's' : ''}!`;
      } else if (duplicateEntries.length > 0 && insertedCount === 0) {
        successMessage = `⚠️ All ${duplicateEntries.length} record${duplicateEntries.length > 1 ? 's' : ''} were duplicates and skipped.`;
      } else {
        successMessage = "✅ Upload completed!";
      }
      
      if (skippedCount > 0 && duplicateEntries.length === 0) {
        successMessage += ` (${skippedCount} row${skippedCount > 1 ? 's' : ''} skipped due to errors)`;
      }
      
      if (duplicateEntries.length > 0) {
        successMessage += ` ${duplicateEntries.length} duplicate(s) found and skipped.`;
        setMessage(successMessage);
        setMessageType("warning");
      } else {
        setMessage(successMessage);
        setMessageType("success");
        setTimeout(() => {
          if (duplicateEntries.length === 0) {
            resetForm();
          }
        }, 3000);
      }
      
    } catch (err: any) {
      if (err.response?.data?.schemaMismatch) {
        const errorData = err.response.data;
        setSchemaMismatch({
          message: errorData.message || "Schema mismatch detected",
          missingColumns: errorData.missingColumns || [],
          extraColumns: errorData.extraColumns || []
        });
        setMessage(`❌ ${errorData.message || "Schema mismatch detected"}`);
        setMessageType("error");
      } else if (err.code === 'ECONNABORTED') {
        setMessage("❌ Upload timed out. Please try with a smaller file.");
        setMessageType("error");
      } else {
        const errorMsg = err.response?.data?.message || "Upload failed. Please try again.";
        setMessage(`❌ ${errorMsg}`);
        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Flat Header Section - No Shadows, No 3D */}
        <div className="relative mb-10">
          <div className="relative">
            {/* Flat Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="relative p-8 md:p-10">
                {/* Simple background color */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"></div>
                
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left Section - Title & Description */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Flat Icon Container */}
                      <div className="p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                        <FileSpreadsheet className="h-7 w-7 text-white" />
                      </div>
                      
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                          Bulk Buyer Upload
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100/70 dark:bg-yellow-900/40 px-2.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                            Enterprise
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Secure Upload
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
                      Upload multiple buyers at once using our Excel template. 
                      <span className="hidden sm:inline"> Streamline your buyer management process with bulk import.</span>
                    </p>
                  </div>
                  
                  {/* Right Section - Flat Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Bulk Import</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">1000+ Records</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Quick Upload</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card - Flat Design */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            {/* Stats Section - Shows after upload */}
            {uploadStats && (
              <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{uploadStats.inserted}</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Inserted</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{uploadStats.duplicates}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">Duplicates</p>
                    </div>
                  </div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <div>
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{uploadStats.skipped}</p>
                      <p className="text-xs text-rose-700 dark:text-rose-300">Skipped</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{uploadStats.totalRows}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Total Rows</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Instructions - Flat */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-lg">
                      📋 Quick Guide
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300">
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          Download the Excel template below
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          Fill in buyer details in the template
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          Upload the filled Excel file
                        </li>
                      </ul>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="font-medium">Duplicate Prevention:</span> Records with same product, company name, and matching contact/email will be skipped
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="font-medium">Required Columns:</span> product, company_name, contact_numbers, emails
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Template - Flat */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <Download className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Get Started</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">Download the template to begin</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 font-medium flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Upload Section - Flat */}
              <div 
                className={`relative rounded-xl border-2 border-dashed transition-all duration-300 p-8 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                    : file 
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {dragActive && (
                  <div className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <div className="text-blue-600 dark:text-blue-400 font-medium text-lg">Drop your file here</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-xl ${
                      file 
                        ? 'bg-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {file ? (
                        <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Upload className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {file ? 'File Selected' : 'Drop your Excel file here'}
                  </h3>
                  
                  <input
                    ref={fileInputRef}
                    id="fileInput"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {!file && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </>
                  )}

                  {file && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-foreground">{file.name}</span>
                        <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handleUpload}
                          disabled={loading}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 ${
                            loading
                              ? "bg-slate-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload Buyers
                            </>
                          )}
                        </button>
                        <button
                          onClick={resetForm}
                          className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-4 rounded-xl flex items-start justify-between gap-4 ${
                    messageType === "success"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                      : messageType === "warning"
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {messageType === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />}
                    {messageType === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />}
                    {messageType === "error" && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5" />}
                    <div>
                      <p className={`font-medium ${
                        messageType === "success" ? "text-emerald-700 dark:text-emerald-300" :
                        messageType === "warning" ? "text-amber-700 dark:text-amber-300" :
                        "text-rose-700 dark:text-rose-300"
                      }`}>
                        {message}
                      </p>
                      {messageType === "warning" && duplicates.length > 0 && (
                        <button
                          onClick={() => setShowDuplicates(!showDuplicates)}
                          className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline flex items-center gap-1"
                        >
                          {showDuplicates ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showDuplicates ? "Hide Duplicates" : "View Duplicates"}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMessage("");
                      setMessageType("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Schema Mismatch Details */}
              {schemaMismatch && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-rose-800 dark:text-rose-300 text-lg mb-3">
                        ⚠️ Schema Mismatch Detected
                      </h4>
                      <div className="space-y-4">
                        {schemaMismatch.missingColumns.length > 0 && (
                          <div>
                            <p className="font-medium text-rose-700 dark:text-rose-300 mb-2">Missing Columns:</p>
                            <div className="flex flex-wrap gap-2">
                              {schemaMismatch.missingColumns.map((col, index) => (
                                <span key={index} className="bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                                  {col}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
                              Please add these columns to your Excel file.
                            </p>
                          </div>
                        )}
                        {schemaMismatch.extraColumns.length > 0 && (
                          <div>
                            <p className="font-medium text-rose-700 dark:text-rose-300 mb-2">Extra Columns:</p>
                            <div className="flex flex-wrap gap-2">
                              {schemaMismatch.extraColumns.map((col, index) => (
                                <span key={index} className="bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                                  {col}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
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
                        className="mt-4 text-sm text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-medium underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicates Display */}
              {showDuplicates && duplicates.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Duplicate Entries Skipped ({duplicates.length})
                    </h4>
                    <button
                      onClick={() => setShowDuplicates(false)}
                      className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-amber-200 dark:border-amber-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-amber-100 dark:bg-amber-900/30">
                        <tr>
                          <th className="px-4 py-3 text-left text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Product
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              Company
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Contacts
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Emails
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-200 dark:divide-amber-800">
                        {duplicates.map((dup, index) => (
                          <tr key={index} className="hover:bg-amber-100/50 dark:hover:bg-amber-900/10 transition-colors">
                            <td className="px-4 py-3 text-amber-800 dark:text-amber-300 font-medium">{dup.product}</td>
                            <td className="px-4 py-3 text-amber-800 dark:text-amber-300">{dup.company_name}</td>
                            <td className="px-4 py-3 text-amber-800 dark:text-amber-300 text-xs">{dup.contact_numbers}</td>
                            <td className="px-4 py-3 text-amber-800 dark:text-amber-300 text-xs">{dup.emails}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Supported formats: .xlsx, .xls • Max file size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerBulkUpload;