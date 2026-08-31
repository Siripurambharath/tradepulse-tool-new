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
import { API_URL } from '@/components/api';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"></div>
              
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                {/* Left Section */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-2.5 md:p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex-shrink-0">
                      <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B1849] dark:text-[#0B1849] truncate">
                        Bulk Buyer Upload
                      </h1>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100/70 dark:bg-yellow-900/40 px-2 sm:px-2.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                          Enterprise
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">•</span>
                        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5 sm:gap-1">
                          <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Secure Upload
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Upload multiple buyers at once using our Excel template.
                    <span className="hidden sm:inline"> Streamline your buyer management process with bulk import.</span>
                  </p>
                </div>
                
                {/* Right Section - Flat Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap">Bulk Import</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">1000+ Records</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">Quick Upload</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Stats Section */}
            {uploadStats && (
              <div className="mb-4 sm:mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{uploadStats.inserted}</p>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-emerald-700 dark:text-emerald-300 truncate">Inserted</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <AlertTriangle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400">{uploadStats.duplicates}</p>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-amber-700 dark:text-amber-300 truncate">Duplicates</p>
                    </div>
                  </div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <XCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-rose-600 dark:text-rose-400">{uploadStats.skipped}</p>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-rose-700 dark:text-rose-300 truncate">Skipped</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">{uploadStats.totalRows}</p>
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-blue-700 dark:text-blue-300 truncate">Total Rows</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1.5 sm:mb-2 text-sm sm:text-base md:text-lg">
                      📋 Quick Guide
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      <ul className="space-y-1 sm:space-y-1.5">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="break-words">Download the Excel template below</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="break-words">Fill in buyer details in the template</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="break-words">Upload the filled Excel file</span>
                        </li>
                      </ul>
                      <ul className="space-y-1 sm:space-y-1.5">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="break-words"><span className="font-medium">Duplicate Prevention:</span> Records with same product, company name, and matching contact/email will be skipped</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="break-words"><span className="font-medium">Required Columns:</span> product, company_name, contact_numbers, emails</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-emerald-500/20 rounded-lg flex-shrink-0">
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">Get Started</h4>
                      <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 truncate">Download the template to begin</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Upload Section */}
              <div 
                className={`relative rounded-lg sm:rounded-xl border-2 border-dashed transition-all duration-300 p-4 sm:p-6 md:p-8 ${
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
                  <div className="absolute inset-0 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <div className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">Drop your file here</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                    <div className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl ${
                      file 
                        ? 'bg-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {file ? (
                        <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2">
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
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                        or click to browse
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        Choose File
                      </button>
                    </>
                  )}

                  {file && (
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <FileSpreadsheet className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">{file.name}</span>
                        <span className="text-muted-foreground text-[10px] sm:text-xs">({formatFileSize(file.size)})</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        <button
                          onClick={handleUpload}
                          disabled={loading}
                          className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                            loading
                              ? "bg-slate-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              <span className="truncate">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="truncate">Upload Buyers</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={resetForm}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 ${
                    messageType === "success"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                      : messageType === "warning"
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    {messageType === "success" && <CheckCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />}
                    {messageType === "warning" && <AlertTriangle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />}
                    {messageType === "error" && <XCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium break-words ${
                        messageType === "success" ? "text-emerald-700 dark:text-emerald-300" :
                        messageType === "warning" ? "text-amber-700 dark:text-amber-300" :
                        "text-rose-700 dark:text-rose-300"
                      }`}>
                        {message}
                      </p>
                      {messageType === "warning" && duplicates.length > 0 && (
                        <button
                          onClick={() => setShowDuplicates(!showDuplicates)}
                          className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline flex items-center gap-1"
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
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <XCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  </button>
                </div>
              )}

              {/* Schema Mismatch Details */}
              {schemaMismatch && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-rose-800 dark:text-rose-300 text-sm sm:text-base md:text-lg mb-2 sm:mb-3">
                        ⚠️ Schema Mismatch Detected
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {schemaMismatch.missingColumns.length > 0 && (
                          <div>
                            <p className="font-medium text-rose-700 dark:text-rose-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Missing Columns:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {schemaMismatch.missingColumns.map((col, index) => (
                                <span key={index} className="bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium break-words">
                                  {col}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 mt-1.5 sm:mt-2">
                              Please add these columns to your Excel file.
                            </p>
                          </div>
                        )}
                        {schemaMismatch.extraColumns.length > 0 && (
                          <div>
                            <p className="font-medium text-rose-700 dark:text-rose-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Extra Columns:</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {schemaMismatch.extraColumns.map((col, index) => (
                                <span key={index} className="bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium break-words">
                                  {col}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 mt-1.5 sm:mt-2">
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
                        className="mt-3 sm:mt-4 text-xs sm:text-sm text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-medium underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicates Display */}
              {showDuplicates && duplicates.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2">
                      <AlertTriangle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 flex-shrink-0" />
                      <span className="break-words">Duplicate Entries Skipped ({duplicates.length})</span>
                    </h4>
                    <button
                      onClick={() => setShowDuplicates(false)}
                      className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 flex-shrink-0"
                    >
                      <XCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                    </button>
                  </div>
                  <div className="max-h-48 sm:max-h-52 md:max-h-64 overflow-y-auto rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="overflow-x-auto">
                      <table className="min-w-[500px] sm:min-w-full text-xs sm:text-sm">
                        <thead className="bg-amber-100 dark:bg-amber-900/30">
                          <tr>
                            <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-amber-800 dark:text-amber-300">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="text-[8px] sm:text-[10px] md:text-xs">Product</span>
                              </div>
                            </th>
                            <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-amber-800 dark:text-amber-300">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="text-[8px] sm:text-[10px] md:text-xs">Company</span>
                              </div>
                            </th>
                            <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-amber-800 dark:text-amber-300">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="text-[8px] sm:text-[10px] md:text-xs">Contacts</span>
                              </div>
                            </th>
                            <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-amber-800 dark:text-amber-300">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="text-[8px] sm:text-[10px] md:text-xs">Emails</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200 dark:divide-amber-800">
                          {duplicates.map((dup, index) => (
                            <tr key={index} className="hover:bg-amber-100/50 dark:hover:bg-amber-900/10 transition-colors">
                              <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-amber-800 dark:text-amber-300 font-medium text-[10px] sm:text-xs">{dup.product}</td>
                              <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs">{dup.company_name}</td>
                              <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-amber-800 dark:text-amber-300 text-[8px] sm:text-[10px] md:text-xs break-words">{dup.contact_numbers}</td>
                              <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-amber-800 dark:text-amber-300 text-[8px] sm:text-[10px] md:text-xs break-words">{dup.emails}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-5 md:mt-6 text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground">
          <p className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            <span className="break-words">Supported formats: .xlsx, .xls</span>
            <span className="hidden xs:inline">•</span>
            <span className="break-words">Max file size: 10MB</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerBulkUpload;