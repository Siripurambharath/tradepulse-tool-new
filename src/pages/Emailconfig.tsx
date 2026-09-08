// import React, { useState, useEffect } from "react";
// import { API_URL, ACTIVITY_URL } from "@/components/api";
// import { 
//   Mail, Settings, Save, Send, CheckCircle, AlertCircle,
//   User, AtSign, Server, Lock, Key, Shield, 
//   Globe, Database, RefreshCw, Sparkles, 
//   Building, Phone, MapPin, Clock, Activity,
//   ChevronRight, ArrowRight, Check, X
// } from 'lucide-react';
// import { Eye, EyeOff } from 'lucide-react';

// // Activity Log Helper Functions
// const getDeviceInfo = () => {
//   const userAgent = navigator.userAgent;
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

// const getIPAddress = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.error('Error fetching IP:', error);
//     return '127.0.0.1';
//   }
// };

// const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
//   try {
//     const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//     const ipAddress = await getIPAddress();
//     const device = getDeviceInfo();

//     const logData = {
//       userId: seller.id || 1,
//       userName: seller.name || seller.email || 'Unknown',
//       role: seller.role || 'seller',
//       action_id: actionId,
//       module_id: moduleId,
//       description: description,
//       ipAddress,
//       device,
//       status: 'SUCCESS',
//       ...additionalData
//     };

//     const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(logData),
//     });

//     const result = await response.json();
//     if (!result.success) {
//       console.error('Failed to create activity log:', result.message);
//     }
//     return result;
//   } catch (error) {
//     console.error('Error creating activity log:', error);
//     return null;
//   }
// };

// export default function EmailConfiguration() {
//   const [formData, setFormData] = useState({
//     profileName: "",
//     provider: "",
//     senderName: "",
//     senderEmail: "",
//     smtpHost: "",
//     smtpPort: "",
//     imapHost: "",
//     imapPort: "",
//     username: "",
//     password: "",
//     apiKey: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [emailConfig, setEmailConfig] = useState(0);
//   const [emailSent, setEmailSent] = useState(0);
//   const [sendingTest, setSendingTest] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     fetchConfig();
//     createActivityLog(39, 12, 'Viewed email configuration page');
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const fetchConfig = async () => {
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller"));
//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`);
//       const data = await response.json();

//       if (data.success) {
//         setEmailConfig(data.data.email_config);
//         setEmailSent(data.data.email_sent);
//         setFormData({
//           profileName: data.data.profile_name || "",
//           provider: data.data.provider || "",
//           senderName: data.data.sender_name || "",
//           senderEmail: data.data.sender_email || "",
//           smtpHost: data.data.smtp_host || "",
//           smtpPort: data.data.smtp_port || "",
//           imapHost: data.data.imap_host || "",
//           imapPort: data.data.imap_port || "",
//           username: data.data.username || "",
//           password: data.data.password || "",
//           apiKey: data.data.api_key || "",
//         });
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const seller = JSON.parse(localStorage.getItem("seller"));

//       await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
//         profile_name: formData.profileName,
//         provider: formData.provider,
//         sender_email: formData.senderEmail
//       });

//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setEmailConfig(1);
//         alert("Configuration updated successfully");
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       alert("Failed to update");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendTestMail = async () => {
//     try {
//       setSendingTest(true);
//       const seller = JSON.parse(localStorage.getItem("seller"));
//       const response = await fetch(`${API_URL}/api/send-test-email/${seller.id}`, {
//         method: "POST"
//       });
//       const data = await response.json();
//       if (data.success) {
//         setEmailSent(1);
//         alert("Test Email Sent Successfully.");
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       alert("Unable to send email.");
//     } finally {
//       setSendingTest(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-4 sm:p-6">
//       {/* Decorative gradient header */}
//       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="mb-4 sm:mb-6 md:mb-8">
//           <div className="flex items-center gap-2 sm:gap-3 mb-2">
//             <div className="p-2 sm:p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
//               <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Email Configuration
//               </h1>
//               <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
//                 <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
//                 <span className="hidden xs:inline">Configure your email settings for sending and receiving</span>
//                 <span className="xs:hidden">Configure email settings</span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Status Cards */}
//         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
//           <div className={`rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
//             emailConfig === 1 
//               ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
//               : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration</p>
//                 <p className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
//                   {emailConfig === 1 ? (
//                     <>
//                       <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
//                       <span className="text-emerald-700 text-sm sm:text-base">Configured</span>
//                     </>
//                   ) : (
//                     <>
//                       <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
//                       <span className="text-gray-600 text-sm sm:text-base">Not Configured</span>
//                     </>
//                   )}
//                 </p>
//               </div>
//               <div className={`p-2 sm:p-2.5 rounded-xl ${
//                 emailConfig === 1 
//                   ? 'bg-emerald-100' 
//                   : 'bg-gray-100'
//               }`}>
//                 <Shield className={`h-4 w-4 sm:h-5 sm:w-5 ${
//                   emailConfig === 1 
//                     ? 'text-emerald-600' 
//                     : 'text-gray-400'
//                 }`} />
//               </div>
//             </div>
//           </div>

//           <div className={`rounded-2xl border p-3 sm:p-4 transition-all duration-300 ${
//             emailSent === 1 
//               ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
//               : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Test Email</p>
//                 <p className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
//                   {emailSent === 1 ? (
//                     <>
//                       <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
//                       <span className="text-emerald-700 text-sm sm:text-base">Sent</span>
//                     </>
//                   ) : (
//                     <>
//                       <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
//                       <span className="text-amber-700 text-sm sm:text-base">Pending</span>
//                     </>
//                   )}
//                 </p>
//               </div>
//               <div className={`p-2 sm:p-2.5 rounded-xl ${
//                 emailSent === 1 
//                   ? 'bg-emerald-100' 
//                   : 'bg-amber-50'
//               }`}>
//                 <Send className={`h-4 w-4 sm:h-5 sm:w-5 ${
//                   emailSent === 1 
//                     ? 'text-emerald-600' 
//                     : 'text-amber-500'
//                 }`} />
//               </div>
//             </div>
//           </div>

//           <div className="col-span-1 xs:col-span-2 sm:col-span-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-3 sm:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
//                 <p className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
//                   {emailConfig === 1 && emailSent === 1 ? (
//                     <>
//                       <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
//                       <span className="text-emerald-700 text-sm sm:text-base">Ready</span>
//                     </>
//                   ) : emailConfig === 1 ? (
//                     <>
//                       <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
//                       <span className="text-amber-700 text-sm sm:text-base">Test Pending</span>
//                     </>
//                   ) : (
//                     <>
//                       <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
//                       <span className="text-red-700 text-sm sm:text-base">Setup Required</span>
//                     </>
//                   )}
//                 </p>
//               </div>
//               <div className="p-2 sm:p-2.5 bg-white rounded-xl">
//                 <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Configuration Form */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
//           <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
//             <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
//               <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
//               Configuration Details
//             </h2>
//             <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
//               Enter your email server details to start sending and receiving emails
//             </p>
//           </div>

//           <div className="p-4 sm:p-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//               {/* Profile Name */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Profile Name
//                 </label>
//                 <input
//                   type="text"
//                   name="profileName"
//                   value={formData.profileName}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="Sales Gmail"
//                 />
//               </div>

//               {/* Provider */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Provider
//                 </label>
//                 <input
//                   type="text"
//                   name="provider"
//                   value={formData.provider}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="gmail, custom_smtp, etc."
//                 />
//               </div>

//               {/* Sender Name */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Sender Name
//                 </label>
//                 <input
//                   type="text"
//                   name="senderName"
//                   value={formData.senderName}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="Sales Team"
//                 />
//               </div>

//               {/* Sender Email */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <AtSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Sender Email
//                 </label>
//                 <input
//                   type="email"
//                   name="senderEmail"
//                   value={formData.senderEmail}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="sales@company.com"
//                 />
//               </div>

//               {/* SMTP Host */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   SMTP Host
//                 </label>
//                 <input
//                   type="text"
//                   name="smtpHost"
//                   value={formData.smtpHost}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="smtp.example.com"
//                 />
//               </div>

//               {/* SMTP Port */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   SMTP Port
//                 </label>
//                 <input
//                   type="number"
//                   name="smtpPort"
//                   value={formData.smtpPort}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="587"
//                 />
//               </div>

//               {/* IMAP Host */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   IMAP Host
//                 </label>
//                 <input
//                   type="text"
//                   name="imapHost"
//                   value={formData.imapHost}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="imap.example.com"
//                 />
//               </div>

//               {/* IMAP Port */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   IMAP Port
//                 </label>
//                 <input
//                   type="number"
//                   name="imapPort"
//                   value={formData.imapPort}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="993"
//                 />
//               </div>

//               {/* Username */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="sales@gmail.com"
//                 />
//               </div>

//               {/* Password */}
//               <div className="space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   Password / App Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none pr-10 sm:pr-11 text-sm sm:text-base"
//                     placeholder="Enter password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
//                     ) : (
//                       <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* API Key */}
//               <div className="col-span-1 sm:col-span-2 space-y-1.5">
//                 <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                   <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                   API Key
//                   <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
//                     (only if using an API-based provider)
//                   </span>
//                 </label>
//                 <input
//                   type="password"
//                   name="apiKey"
//                   value={formData.apiKey}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none text-sm sm:text-base"
//                   placeholder="Enter API Key"
//                 />
//               </div>
//             </div>

//             {/* Status Messages */}
//             <div className="mt-4 sm:mt-6 space-y-2">
//               {emailConfig === 0 && (
//                 <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
//                   <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
//                   <p className="text-xs sm:text-sm text-red-700">Please save configuration first before sending test email.</p>
//                 </div>
//               )}

//               {emailConfig === 1 && emailSent === 1 && (
//                 <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
//                   <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
//                   <p className="text-xs sm:text-sm text-emerald-700">Test email already sent successfully. Your configuration is working!</p>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                     <span className="hidden xs:inline">Saving...</span>
//                     <span className="xs:hidden">Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span className="hidden xs:inline">Save Configuration</span>
//                     <span className="xs:hidden">Save</span>
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={sendTestMail}
//                 disabled={emailConfig !== 1 || emailSent === 1 || sendingTest}
//                 className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
//                   emailConfig !== 1 || emailSent === 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
//                 }`}
//               >
//                 {sendingTest ? (
//                   <>
//                     <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                     <span className="hidden xs:inline">Sending...</span>
//                     <span className="xs:hidden">Sending...</span>
//                   </>
//                 ) : emailSent === 1 ? (
//                   <>
//                     <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span className="hidden xs:inline">Test Mail Sent</span>
//                     <span className="xs:hidden">Sent</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span className="hidden xs:inline">Send Test Mail</span>
//                     <span className="xs:hidden">Test</span>
//                   </>
//                 )}
//               </button>

//               {emailConfig === 1 && emailSent === 1 && (
//                 <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-emerald-600 w-full sm:w-auto mt-2 sm:mt-0">
//                   <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                   <span className="hidden xs:inline">All set! Ready to send emails.</span>
//                   <span className="xs:hidden">Ready!</span>
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect } from "react";
// import { API_URL, ACTIVITY_URL } from "@/components/api";
// import { 
//   Mail, Settings, Save, Send, CheckCircle, AlertCircle,
//   User, AtSign, Server, Lock, Key, Shield, 
//   Globe, Database, RefreshCw, Sparkles, 
//   Building, Phone, MapPin, Clock, Activity,
//   ChevronRight, ArrowRight, Check, X, 
//   Zap, Rocket, Crown, Gem, Star, Award,
//   Layers, Grid, List, SlidersHorizontal,
//   Play, Pause, Maximize2, Minimize2,
//   Circle, Gauge, Target, TrendingUp,
//   BarChart3, PieChart, LineChart
// } from 'lucide-react';
// import { Eye, EyeOff } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ============================================
// // ANIMATED BACKGROUND PARTICLES
// // ============================================
// const AnimatedBackground = () => {
//   const [particles] = useState(() => 
//     Array.from({ length: 25 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 2 + 1,
//       duration: Math.random() * 15 + 10,
//       delay: Math.random() * 8,
//       opacity: Math.random() * 0.15 + 0.05,
//     }))
//   );

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: p.size,
//             height: p.size,
//           }}
//           animate={{
//             y: [0, -25, 0],
//             x: [0, 15, 0],
//             opacity: [p.opacity, p.opacity * 1.5, p.opacity],
//           }}
//           transition={{
//             duration: p.duration,
//             delay: p.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//       <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
//     </div>
//   );
// };

// // ============================================
// // ACTIVITY LOG HELPERS
// // ============================================
// const getDeviceInfo = () => {
//   const userAgent = navigator.userAgent;
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

// const getIPAddress = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.error('Error fetching IP:', error);
//     return '127.0.0.1';
//   }
// };

// const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
//   try {
//     const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//     const ipAddress = await getIPAddress();
//     const device = getDeviceInfo();

//     const logData = {
//       userId: seller.id || 1,
//       userName: seller.name || seller.email || 'Unknown',
//       role: seller.role || 'seller',
//       action_id: actionId,
//       module_id: moduleId,
//       description: description,
//       ipAddress,
//       device,
//       status: 'SUCCESS',
//       ...additionalData
//     };

//     const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(logData),
//     });

//     const result = await response.json();
//     if (!result.success) {
//       console.error('Failed to create activity log:', result.message);
//     }
//     return result;
//   } catch (error) {
//     console.error('Error creating activity log:', error);
//     return null;
//   }
// };

// // ============================================
// // STATUS CARD COMPONENT
// // ============================================
// const StatusCard = ({ title, status, icon: Icon, statusIcon: StatusIcon, color, description }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ scale: 1.02 }}
//       className="relative"
//     >
//       <div 
//         className={`relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 transition-all duration-500 cursor-pointer
//           ${status === 'success' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-green-50/80' :
//             status === 'warning' ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-yellow-50/80' :
//             status === 'error' ? 'border-red-200 bg-gradient-to-br from-red-50/80 to-rose-50/80' :
//             'border-gray-200 bg-gradient-to-br from-gray-50/80 to-slate-50/80'}`}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Glow effect */}
//         <motion.div
//           className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 blur-xl`}
//           animate={{ opacity: isHovered ? 0.15 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         <div className="relative flex items-center justify-between">
//           <div className="flex-1 min-w-0">
//             <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
//               {title}
//             </p>
//             <div className="flex items-center gap-2 mt-1">
//               {StatusIcon && (
//                 <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0
//                   ${status === 'success' ? 'text-emerald-600' :
//                     status === 'warning' ? 'text-amber-600' :
//                     status === 'error' ? 'text-red-600' :
//                     'text-gray-400'}`}
//                 />
//               )}
//               <p className={`text-sm sm:text-base font-bold
//                 ${status === 'success' ? 'text-emerald-700' :
//                   status === 'warning' ? 'text-amber-700' :
//                   status === 'error' ? 'text-red-700' :
//                   'text-gray-600'}`}
//               >
//                 {status === 'success' ? 'Configured' :
//                  status === 'warning' ? 'Pending' :
//                  status === 'error' ? 'Setup Required' :
//                  'Not Configured'}
//               </p>
//             </div>
//             {description && (
//               <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
//                 {description}
//               </p>
//             )}
//           </div>
          
//           <motion.div 
//             className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0
//               ${status === 'success' ? 'bg-emerald-100' :
//                 status === 'warning' ? 'bg-amber-100' :
//                 status === 'error' ? 'bg-red-100' :
//                 'bg-gray-100'}`}
//             animate={{ 
//               rotate: isHovered ? [0, -5, 5, 0] : 0,
//               scale: isHovered ? 1.1 : 1,
//             }}
//             transition={{ duration: 0.4 }}
//           >
//             <Icon className={`h-4 w-4 sm:h-5 sm:w-5
//               ${status === 'success' ? 'text-emerald-600' :
//                 status === 'warning' ? 'text-amber-600' :
//                 status === 'error' ? 'text-red-600' :
//                 'text-gray-400'}`}
//             />
//           </motion.div>
//         </div>
        
//         {/* Animated progress indicator */}
//         {status !== 'error' && (
//           <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30">
//             <motion.div 
//               className={`h-full bg-gradient-to-r ${color}`}
//               initial={{ width: 0 }}
//               animate={{ width: status === 'success' ? '100%' : '50%' }}
//               transition={{ duration: 1, delay: 0.5 }}
//             />
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// // ============================================
// // INPUT FIELD WITH ANIMATION
// // ============================================
// const AnimatedInput = ({ label, icon: Icon, name, value, onChange, placeholder, type = "text", className = "" }: any) => {
//   const [isFocused, setIsFocused] = useState(false);
  
//   return (
//     <motion.div 
//       className="space-y-1.5"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
//         <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//         {label}
//       </label>
//       <div className="relative">
//         <input
//           type={type}
//           name={name}
//           value={value}
//           onChange={onChange}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//           placeholder={placeholder}
//           className={`w-full border-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 
//             bg-white/80 backdrop-blur-sm 
//             transition-all duration-300 outline-none text-sm sm:text-base
//             ${isFocused 
//               ? 'border-blue-400 ring-2 ring-blue-400/20 shadow-lg shadow-blue-500/10' 
//               : 'border-gray-200 hover:border-gray-300'
//             } ${className}`}
//         />
//         <motion.div 
//           className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
//           initial={{ width: 0 }}
//           animate={{ width: isFocused ? '100%' : 0 }}
//           transition={{ duration: 0.3 }}
//         />
//       </div>
//     </motion.div>
//   );
// };

// // ============================================
// // MAIN COMPONENT
// // ============================================
// export default function EmailConfiguration() {
//   const [formData, setFormData] = useState({
//     profileName: "",
//     provider: "",
//     senderName: "",
//     senderEmail: "",
//     smtpHost: "",
//     smtpPort: "",
//     imapHost: "",
//     imapPort: "",
//     username: "",
//     password: "",
//     apiKey: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [emailConfig, setEmailConfig] = useState(0);
//   const [emailSent, setEmailSent] = useState(0);
//   const [sendingTest, setSendingTest] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showApiKey, setShowApiKey] = useState(false);
//   const [activeTab, setActiveTab] = useState('smtp');

//   useEffect(() => {
//     fetchConfig();
//     createActivityLog(39, 12, 'Viewed email configuration page');
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const fetchConfig = async () => {
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`);
//       const data = await response.json();

//       if (data.success) {
//         setEmailConfig(data.data.email_config);
//         setEmailSent(data.data.email_sent);
//         setFormData({
//           profileName: data.data.profile_name || "",
//           provider: data.data.provider || "",
//           senderName: data.data.sender_name || "",
//           senderEmail: data.data.sender_email || "",
//           smtpHost: data.data.smtp_host || "",
//           smtpPort: data.data.smtp_port || "",
//           imapHost: data.data.imap_host || "",
//           imapPort: data.data.imap_port || "",
//           username: data.data.username || "",
//           password: data.data.password || "",
//           apiKey: data.data.api_key || "",
//         });
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//       await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
//         profile_name: formData.profileName,
//         provider: formData.provider,
//         sender_email: formData.senderEmail
//       });

//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setEmailConfig(1);
//         // Show success toast
//         alert("✅ Configuration updated successfully");
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       alert("❌ Failed to update configuration");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendTestMail = async () => {
//     try {
//       setSendingTest(true);
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const response = await fetch(`${API_URL}/api/send-test-email/${seller.id}`, {
//         method: "POST"
//       });
//       const data = await response.json();
//       if (data.success) {
//         setEmailSent(1);
//         alert("✅ Test Email Sent Successfully!");
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       alert("❌ Unable to send email.");
//     } finally {
//       setSendingTest(false);
//     }
//   };

//   const isConfigReady = emailConfig === 1 && emailSent === 1;
//   const isTestPending = emailConfig === 1 && emailSent === 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-purple-50/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <AnimatedBackground />
      
//       <div className="relative p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
//         {/* ============================================ */}
//         {/* HEADER WITH ANIMATION */}
//         {/* ============================================ */}
//         <motion.div 
//           className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-blue-500/10"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="relative z-10">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <motion.div 
//                   className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl shadow-blue-500/30"
//                   whileHover={{ rotate: 10, scale: 1.05 }}
//                 >
//                   <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
//                 </motion.div>
//                 <div>
//                   <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
//                     Email Configuration
//                   </h1>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
//                     <Sparkles className="h-3.5 w-3.5" />
//                     Configure your email settings for sending and receiving
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border text-xs font-medium
//                   ${isConfigReady 
//                     ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50'
//                     : emailConfig === 1
//                     ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50'
//                     : 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50'
//                   }`}
//                 >
//                   {isConfigReady ? (
//                     <>
//                       <CheckCircle className="h-3.5 w-3.5" />
//                       <span>Ready</span>
//                     </>
//                   ) : emailConfig === 1 ? (
//                     <>
//                       <Clock className="h-3.5 w-3.5" />
//                       <span>Test Pending</span>
//                     </>
//                   ) : (
//                     <>
//                       <AlertCircle className="h-3.5 w-3.5" />
//                       <span>Setup Required</span>
//                     </>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium backdrop-blur-sm border border-green-200/50 dark:border-green-800/50">
//                   <Zap className="h-3.5 w-3.5" />
//                   <span>Live</span>
//                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Decorative elements */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/5 to-blue-500/5 rounded-full blur-3xl" />
//         </motion.div>

//         {/* ============================================ */}
//         {/* STATUS CARDS */}
//         {/* ============================================ */}
//         <motion.div 
//           className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <StatusCard
//             title="Configuration Status"
//             status={emailConfig === 1 ? 'success' : 'error'}
//             icon={Settings}
//             statusIcon={emailConfig === 1 ? CheckCircle : X}
//             color="from-emerald-500 to-green-500"
//             description={emailConfig === 1 ? "Email settings configured" : "Please configure your settings"}
//           />
          
//           <StatusCard
//             title="Test Email Status"
//             status={emailSent === 1 ? 'success' : emailConfig === 1 ? 'warning' : 'error'}
//             icon={Send}
//             statusIcon={emailSent === 1 ? CheckCircle : emailConfig === 1 ? Clock : X}
//             color={emailSent === 1 ? "from-emerald-500 to-green-500" : "from-amber-500 to-yellow-500"}
//             description={emailSent === 1 ? "Test email sent successfully" : emailConfig === 1 ? "Ready to send test" : "Configure first"}
//           />
          
//           <StatusCard
//             title="Overall Status"
//             status={isConfigReady ? 'success' : isTestPending ? 'warning' : 'error'}
//             icon={Shield}
//             statusIcon={isConfigReady ? Shield : isTestPending ? Clock : AlertCircle}
//             color={isConfigReady ? "from-emerald-500 to-green-500" : "from-amber-500 to-yellow-500"}
//             description={isConfigReady ? "System is fully operational" : isTestPending ? "Test email pending" : "Setup required"}
//           />
//         </motion.div>

//         {/* ============================================ */}
//         {/* MAIN CONFIGURATION FORM */}
//         {/* ============================================ */}
//         <motion.div 
//           className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           {/* Form Header */}
//           <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-800/50">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
//                   <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
//                   Configuration Details
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//                   Enter your email server details to start sending and receiving emails
//                 </p>
//               </div>
              
//               {/* Tabs */}
//               <div className="flex bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
//                 <button
//                   onClick={() => setActiveTab('smtp')}
//                   className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
//                     activeTab === 'smtp' 
//                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   SMTP Settings
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('imap')}
//                   className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
//                     activeTab === 'imap' 
//                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   IMAP Settings
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('advanced')}
//                   className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
//                     activeTab === 'advanced' 
//                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   Advanced
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Form Body */}
//           <div className="p-4 sm:p-6 md:p-8">
//             <AnimatePresence mode="wait">
//               {/* SMTP Settings */}
//               {activeTab === 'smtp' && (
//                 <motion.div
//                   key="smtp"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
//                 >
//                   <AnimatedInput
//                     label="Profile Name"
//                     icon={User}
//                     name="profileName"
//                     value={formData.profileName}
//                     onChange={handleChange}
//                     placeholder="e.g., Sales Gmail"
//                   />
                  
//                   <AnimatedInput
//                     label="Provider"
//                     icon={Server}
//                     name="provider"
//                     value={formData.provider}
//                     onChange={handleChange}
//                     placeholder="e.g., gmail, custom_smtp"
//                   />
                  
//                   <AnimatedInput
//                     label="Sender Name"
//                     icon={Building}
//                     name="senderName"
//                     value={formData.senderName}
//                     onChange={handleChange}
//                     placeholder="e.g., Sales Team"
//                   />
                  
//                   <AnimatedInput
//                     label="Sender Email"
//                     icon={AtSign}
//                     name="senderEmail"
//                     value={formData.senderEmail}
//                     onChange={handleChange}
//                     placeholder="e.g., sales@company.com"
//                     type="email"
//                   />
                  
//                   <AnimatedInput
//                     label="SMTP Host"
//                     icon={Globe}
//                     name="smtpHost"
//                     value={formData.smtpHost}
//                     onChange={handleChange}
//                     placeholder="e.g., smtp.gmail.com"
//                   />
                  
//                   <AnimatedInput
//                     label="SMTP Port"
//                     icon={Server}
//                     name="smtpPort"
//                     value={formData.smtpPort}
//                     onChange={handleChange}
//                     placeholder="e.g., 587"
//                     type="number"
//                   />
//                 </motion.div>
//               )}

//               {/* IMAP Settings */}
//               {activeTab === 'imap' && (
//                 <motion.div
//                   key="imap"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
//                 >
//                   <AnimatedInput
//                     label="IMAP Host"
//                     icon={Database}
//                     name="imapHost"
//                     value={formData.imapHost}
//                     onChange={handleChange}
//                     placeholder="e.g., imap.gmail.com"
//                   />
                  
//                   <AnimatedInput
//                     label="IMAP Port"
//                     icon={Database}
//                     name="imapPort"
//                     value={formData.imapPort}
//                     onChange={handleChange}
//                     placeholder="e.g., 993"
//                     type="number"
//                   />
                  
//                   <AnimatedInput
//                     label="Username"
//                     icon={User}
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     placeholder="e.g., sales@gmail.com"
//                   />
//                 </motion.div>
//               )}

//               {/* Advanced Settings */}
//               {activeTab === 'advanced' && (
//                 <motion.div
//                   key="advanced"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 gap-4 sm:gap-5"
//                 >
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//                     <AnimatedInput
//                       label="Username"
//                       icon={User}
//                       name="username"
//                       value={formData.username}
//                       onChange={handleChange}
//                       placeholder="e.g., sales@gmail.com"
//                     />
                    
//                     <div className="space-y-1.5">
//                       <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
//                         <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                         Password / App Password
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showPassword ? "text" : "password"}
//                           name="password"
//                           value={formData.password}
//                           onChange={handleChange}
//                           className="w-full border-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 
//                             bg-white/80 backdrop-blur-sm 
//                             transition-all duration-300 outline-none text-sm sm:text-base
//                             border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-lg shadow-blue-500/10"
//                           placeholder="Enter password"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                         >
//                           {showPassword ? (
//                             <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
//                           ) : (
//                             <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-1.5">
//                     <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
//                       <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//                       API Key
//                       <span className="text-[10px] sm:text-xs text-gray-400 font-normal">
//                         (only if using an API-based provider)
//                       </span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showApiKey ? "text" : "password"}
//                         name="apiKey"
//                         value={formData.apiKey}
//                         onChange={handleChange}
//                         className="w-full border-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 
//                           bg-white/80 backdrop-blur-sm 
//                           transition-all duration-300 outline-none text-sm sm:text-base
//                           border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-lg shadow-blue-500/10"
//                         placeholder="Enter API Key"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowApiKey(!showApiKey)}
//                         className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                       >
//                         {showApiKey ? (
//                           <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
//                         ) : (
//                           <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Status Messages */}
//             <motion.div 
//               className="mt-4 sm:mt-6 space-y-2"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               {emailConfig === 0 && (
//                 <motion.div 
//                   className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
//                   <p className="text-xs sm:text-sm text-red-700 font-medium">
//                     ⚠️ Please save configuration first before sending test email.
//                   </p>
//                 </motion.div>
//               )}

//               {isConfigReady && (
//                 <motion.div 
//                   className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
//                   <p className="text-xs sm:text-sm text-emerald-700 font-medium">
//                     ✅ Test email already sent successfully. Your configuration is working!
//                   </p>
//                 </motion.div>
//               )}

//               {isTestPending && (
//                 <motion.div 
//                   className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
//                   <p className="text-xs sm:text-sm text-amber-700 font-medium">
//                     ⏳ Configuration is ready. Click "Send Test Mail" to verify your settings.
//                   </p>
//                 </motion.div>
//               )}
//             </motion.div>

//             {/* Action Buttons */}
//             <motion.div 
//               className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <motion.button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 
//                   bg-gradient-to-r from-blue-600 to-indigo-600 
//                   hover:from-blue-700 hover:to-indigo-700 
//                   text-white rounded-xl font-semibold 
//                   shadow-lg hover:shadow-xl 
//                   transition-all duration-300 
//                   disabled:opacity-50 disabled:cursor-not-allowed 
//                   text-sm sm:text-base"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span>Save Configuration</span>
//                   </>
//                 )}
//               </motion.button>

//               <motion.button
//                 onClick={sendTestMail}
//                 disabled={emailConfig !== 1 || emailSent === 1 || sendingTest}
//                 className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold 
//                   transition-all duration-300 text-sm sm:text-base
//                   ${emailConfig !== 1 || emailSent === 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
//                   }`}
//                 whileHover={emailConfig === 1 && emailSent === 0 ? { scale: 1.02 } : {}}
//                 whileTap={emailConfig === 1 && emailSent === 0 ? { scale: 0.98 } : {}}
//               >
//                 {sendingTest ? (
//                   <>
//                     <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
//                     <span>Sending...</span>
//                   </>
//                 ) : emailSent === 1 ? (
//                   <>
//                     <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span>Test Mail Sent</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//                     <span>Send Test Mail</span>
//                   </>
//                 )}
//               </motion.button>

//               {isConfigReady && (
//                 <motion.span 
//                   className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-emerald-600 w-full sm:w-auto mt-2 sm:mt-0"
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.2 }}
//                 >
//                   <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
//                   <span>✨ All set! Ready to send emails.</span>
//                 </motion.span>
//               )}
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* FOOTER */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="flex items-center gap-2 text-xs text-gray-400">
//             <Clock className="h-3.5 w-3.5" />
//             Last updated: {new Date().toLocaleString()}
//             <span className="w-px h-4 bg-gray-300" />
//             <span>Secure connection</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-1.5 text-xs text-gray-400">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                 Live
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }





// import React, { useState, useEffect } from "react";
// import { API_URL, ACTIVITY_URL } from "@/components/api";
// import { 
//   Mail, Settings, Save, Send, CheckCircle, AlertCircle,
//   User, AtSign, Server, Lock, Key, Shield, 
//   Globe, Database, RefreshCw, Sparkles, 
//   Building, Phone, MapPin, Clock, Activity,
//   ChevronRight, ArrowRight, Check, X, 
//   Zap, Rocket, Crown, Gem, Star, Award,
//   Layers, Grid, List, SlidersHorizontal,
//   Play, Pause, Maximize2, Minimize2,
//   Circle, Gauge, Target, TrendingUp,
//   BarChart3, PieChart, LineChart,
//   Cloud, Wifi, Signal, Cpu, HardDrive,
//   ShieldCheck, Fingerprint, ScanEye,
//   Box, Package, Layers3, ZapOff,
//   Timer, Calendar, MessageSquare,
//   Bell, BellRing, AlertTriangle,
//   ShieldAlert, Radio, Antenna
// } from 'lucide-react';
// import { Eye, EyeOff } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ============================================
// // ANIMATED BACKGROUND PARTICLES - ENHANCED
// // ============================================
// const AnimatedBackground = () => {
//   const [particles] = useState(() => 
//     Array.from({ length: 30 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 3 + 1,
//       duration: Math.random() * 20 + 10,
//       delay: Math.random() * 10,
//       opacity: Math.random() * 0.2 + 0.05,
//       color: ['from-blue-500/10', 'from-purple-500/10', 'from-pink-500/10', 'from-cyan-500/10', 'from-emerald-500/10'][Math.floor(Math.random() * 5)]
//     }))
//   );

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className={`absolute rounded-full bg-gradient-to-r ${p.color} to-transparent`}
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: p.size,
//             height: p.size,
//           }}
//           animate={{
//             y: [0, -30, 0],
//             x: [0, 20, 0],
//             opacity: [p.opacity, p.opacity * 2, p.opacity],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             duration: p.duration,
//             delay: p.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//       <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      
//       {/* Grid pattern overlay */}
//       <div className="absolute inset-0 opacity-5" 
//         style={{
//           backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
//           backgroundSize: '40px 40px'
//         }}
//       />
//     </div>
//   );
// };

// // ============================================
// // ACTIVITY LOG HELPERS (Same as before)
// // ============================================
// const getDeviceInfo = () => {
//   const userAgent = navigator.userAgent;
//   if (userAgent.includes('Chrome')) return 'Chrome';
//   if (userAgent.includes('Firefox')) return 'Firefox';
//   if (userAgent.includes('Safari')) return 'Safari';
//   if (userAgent.includes('Edge')) return 'Edge';
//   return 'Unknown Browser';
// };

// const getIPAddress = async () => {
//   try {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.error('Error fetching IP:', error);
//     return '127.0.0.1';
//   }
// };

// const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
//   try {
//     const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//     const ipAddress = await getIPAddress();
//     const device = getDeviceInfo();

//     const logData = {
//       userId: seller.id || 1,
//       userName: seller.name || seller.email || 'Unknown',
//       role: seller.role || 'seller',
//       action_id: actionId,
//       module_id: moduleId,
//       description: description,
//       ipAddress,
//       device,
//       status: 'SUCCESS',
//       ...additionalData
//     };

//     const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(logData),
//     });

//     const result = await response.json();
//     if (!result.success) {
//       console.error('Failed to create activity log:', result.message);
//     }
//     return result;
//   } catch (error) {
//     console.error('Error creating activity log:', error);
//     return null;
//   }
// };

// // ============================================
// // ENHANCED STATUS CARD
// // ============================================
// const StatusCard = ({ title, status, icon: Icon, statusIcon: StatusIcon, color, description, value }: any) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ scale: 1.02, y: -2 }}
//       className="relative group"
//     >
//       <div 
//         className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-500 cursor-pointer
//           ${status === 'success' ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-white/80 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-gray-900/50' :
//             status === 'warning' ? 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-white/80 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-gray-900/50' :
//             status === 'error' ? 'border-red-200/50 bg-gradient-to-br from-red-50/80 via-rose-50/60 to-white/80 dark:from-red-950/30 dark:via-rose-950/20 dark:to-gray-900/50' :
//             'border-gray-200/50 bg-gradient-to-br from-gray-50/80 via-slate-50/60 to-white/80 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-900/50'}`}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Glassmorphism glow */}
//         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
        
//         <motion.div
//           className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 blur-2xl`}
//           animate={{ opacity: isHovered ? 0.1 : 0 }}
//           transition={{ duration: 0.4 }}
//         />
        
//         <div className="relative">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-3">
//               <motion.div 
//                 className={`p-2.5 rounded-xl
//                   ${status === 'success' ? 'bg-emerald-100/80 dark:bg-emerald-900/30' :
//                     status === 'warning' ? 'bg-amber-100/80 dark:bg-amber-900/30' :
//                     status === 'error' ? 'bg-red-100/80 dark:bg-red-900/30' :
//                     'bg-gray-100/80 dark:bg-gray-800/30'}`}
//                 animate={{ 
//                   rotate: isHovered ? [0, -5, 5, 0] : 0,
//                   scale: isHovered ? 1.1 : 1,
//                 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <Icon className={`h-5 w-5
//                   ${status === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
//                     status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
//                     status === 'error' ? 'text-red-600 dark:text-red-400' :
//                     'text-gray-400'}`}
//                 />
//               </motion.div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   {title}
//                 </p>
//                 {value && (
//                   <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
//                     {value}
//                   </p>
//                 )}
//               </div>
//             </div>
            
//             {StatusIcon && (
//               <StatusIcon className={`h-5 w-5 flex-shrink-0
//                 ${status === 'success' ? 'text-emerald-500' :
//                   status === 'warning' ? 'text-amber-500' :
//                   status === 'error' ? 'text-red-500' :
//                   'text-gray-400'}`}
//               />
//             )}
//           </div>
          
//           <div className="flex items-center justify-between">
//             <p className={`text-sm font-bold
//               ${status === 'success' ? 'text-emerald-700 dark:text-emerald-300' :
//                 status === 'warning' ? 'text-amber-700 dark:text-amber-300' :
//                 status === 'error' ? 'text-red-700 dark:text-red-300' :
//                 'text-gray-600 dark:text-gray-400'}`}
//             >
//               {status === 'success' ? '✓ Configured' :
//                status === 'warning' ? '⟳ Pending' :
//                status === 'error' ? '✕ Setup Required' :
//                '— Not Configured'}
//             </p>
//             {description && (
//               <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
//                 {description}
//               </p>
//             )}
//           </div>
//         </div>
        
//         {/* Animated progress bar */}
//         <motion.div 
//           className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
//           initial={{ scaleX: 0 }}
//           animate={{ scaleX: status === 'success' ? 1 : status === 'warning' ? 0.5 : 0 }}
//           transition={{ duration: 1, delay: 0.5 }}
//           style={{ transformOrigin: 'left' }}
//         >
//           <motion.div 
//             className={`h-full bg-gradient-to-r ${color}`}
//             animate={{ 
//               width: status === 'success' ? '100%' : status === 'warning' ? '50%' : '0%' 
//             }}
//             transition={{ duration: 1.5, delay: 0.7 }}
//           />
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// // ============================================
// // ENHANCED INPUT FIELD WITH GLASS EFFECT
// // ============================================
// const AnimatedInput = ({ label, icon: Icon, name, value, onChange, placeholder, type = "text", className = "", required = false, helper = "" }: any) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const [hasValue, setHasValue] = useState(false);
  
//   useEffect(() => {
//     setHasValue(value?.length > 0);
//   }, [value]);
  
//   return (
//     <motion.div 
//       className="space-y-2"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ scale: 1.01 }}
//       transition={{ duration: 0.3 }}
//     >
//       <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//         <Icon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
//         {label}
//         {required && <span className="text-red-500 text-lg">*</span>}
//       </label>
//       <div className="relative group">
//         <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur transition-opacity duration-300
//           ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
//         />
//         <input
//           type={type}
//           name={name}
//           value={value}
//           onChange={onChange}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//           placeholder={placeholder}
//           className={`relative w-full border-2 rounded-xl px-4 py-3 
//             bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
//             transition-all duration-300 outline-none text-sm 
//             placeholder:text-gray-400 dark:placeholder:text-gray-500
//             ${isFocused 
//               ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10' 
//               : 'border-gray-200/70 dark:border-gray-700/70 hover:border-gray-300 dark:hover:border-gray-600'
//             } ${hasValue ? 'border-emerald-300/50 dark:border-emerald-700/50' : ''} ${className}`}
//         />
//         {hasValue && (
//           <motion.div 
//             className="absolute right-3 top-1/2 -translate-y-1/2"
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//           >
//             <CheckCircle className="h-4 w-4 text-emerald-500" />
//           </motion.div>
//         )}
//         <motion.div 
//           className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
//           initial={{ width: 0 }}
//           animate={{ width: isFocused ? '100%' : 0 }}
//           transition={{ duration: 0.4 }}
//         />
//       </div>
//       {helper && (
//         <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{helper}</p>
//       )}
//     </motion.div>
//   );
// };

// // ============================================
// // TOGGLE SWITCH COMPONENT
// // ============================================
// const ToggleSwitch = ({ label, enabled, onChange, icon: Icon }: any) => {
//   return (
//     <motion.div 
//       className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
//       whileHover={{ scale: 1.01 }}
//     >
//       <div className="flex items-center gap-3">
//         {Icon && <Icon className="h-5 w-5 text-blue-500" />}
//         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
//       </div>
//       <motion.button
//         onClick={() => onChange(!enabled)}
//         className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
//           enabled ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300 dark:bg-gray-600'
//         }`}
//         whileTap={{ scale: 0.95 }}
//       >
//         <motion.div
//           className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
//           animate={{ x: enabled ? 24 : 0 }}
//           transition={{ type: "spring", stiffness: 500, damping: 30 }}
//         />
//       </motion.button>
//     </motion.div>
//   );
// };

// // ============================================
// // MAIN COMPONENT - ENHANCED
// // ============================================
// export default function EmailConfiguration() {
//   const [formData, setFormData] = useState({
//     // Basic Settings
//     profileName: "",
//     displayName: "",
//     emailAddress: "",
//     phoneNumber: "",
    
//     // Advanced Settings
//     timezone: "",
//     language: "",
//     signature: "",
    
//     // SMTP Settings
//     smtpServer: "",
//     smtpPort: "",
//     smtpUsername: "",
//     smtpPassword: "",
//     smtpEncryption: "TLS",
    
//     // IMAP Settings
//     imapServer: "",
//     imapPort: "",
//     imapUsername: "",
//     imapPassword: "",
    
//     // Security Settings
//     twoFactorAuth: false,
//     ipWhitelisting: false,
//     sslVerification: true,
    
//     // Notification Settings
//     emailNotifications: true,
//     dailyDigest: false,
//     alertsEnabled: true,
//   });

//   const [loading, setLoading] = useState(false);
//   const [emailConfig, setEmailConfig] = useState(0);
//   const [emailSent, setEmailSent] = useState(0);
//   const [sendingTest, setSendingTest] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showImapPassword, setShowImapPassword] = useState(false);
//   const [activeSection, setActiveSection] = useState('basic');
//   const [connectionStatus, setConnectionStatus] = useState('idle');

//   useEffect(() => {
//     fetchConfig();
//     createActivityLog(39, 12, 'Viewed email configuration page');
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleToggle = (key: string, value: boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const fetchConfig = async () => {
//     try {
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`);
//       const data = await response.json();

//       if (data.success) {
//         setEmailConfig(data.data.email_config);
//         setEmailSent(data.data.email_sent);
//         setFormData({
//           profileName: data.data.profile_name || "",
//           displayName: data.data.display_name || "",
//           emailAddress: data.data.email_address || "",
//           phoneNumber: data.data.phone_number || "",
//           timezone: data.data.timezone || "UTC",
//           language: data.data.language || "en",
//           signature: data.data.signature || "",
//           smtpServer: data.data.smtp_server || "",
//           smtpPort: data.data.smtp_port || "",
//           smtpUsername: data.data.smtp_username || "",
//           smtpPassword: data.data.smtp_password || "",
//           smtpEncryption: data.data.smtp_encryption || "TLS",
//           imapServer: data.data.imap_server || "",
//           imapPort: data.data.imap_port || "",
//           imapUsername: data.data.imap_username || "",
//           imapPassword: data.data.imap_password || "",
//           twoFactorAuth: data.data.two_factor_auth || false,
//           ipWhitelisting: data.data.ip_whitelisting || false,
//           sslVerification: data.data.ssl_verification !== false,
//           emailNotifications: data.data.email_notifications !== false,
//           dailyDigest: data.data.daily_digest || false,
//           alertsEnabled: data.data.alerts_enabled !== false,
//         });
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");

//       await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
//         profile_name: formData.profileName,
//         email_address: formData.emailAddress
//       });

//       const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setEmailConfig(1);
//         // Show success toast
//         alert("✅ Configuration updated successfully");
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       alert("❌ Failed to update configuration");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendTestMail = async () => {
//     try {
//       setSendingTest(true);
//       setConnectionStatus('connecting');
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
//       setTimeout(() => setConnectionStatus('authenticating'), 1000);
//       setTimeout(() => setConnectionStatus('sending'), 2000);
      
//       const response = await fetch(`${API_URL}/api/send-test-email/${seller.id}`, {
//         method: "POST"
//       });
//       const data = await response.json();
      
//       if (data.success) {
//         setEmailSent(1);
//         setConnectionStatus('success');
//         setTimeout(() => setConnectionStatus('idle'), 3000);
//         alert("✅ Test Email Sent Successfully!");
//       } else {
//         setConnectionStatus('error');
//         setTimeout(() => setConnectionStatus('idle'), 3000);
//         alert(data.message);
//       }
//     } catch (err) {
//       console.log(err);
//       setConnectionStatus('error');
//       setTimeout(() => setConnectionStatus('idle'), 3000);
//       alert("❌ Unable to send email.");
//     } finally {
//       setSendingTest(false);
//     }
//   };

//   const testConnection = async () => {
//     try {
//       setConnectionStatus('testing');
//       const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
//       const response = await fetch(`${API_URL}/api/test-connection/${seller.id}`, {
//         method: "GET"
//       });
//       const data = await response.json();
      
//       if (data.success) {
//         setConnectionStatus('success');
//         setTimeout(() => setConnectionStatus('idle'), 3000);
//         alert("✅ Connection successful!");
//       } else {
//         setConnectionStatus('error');
//         setTimeout(() => setConnectionStatus('idle'), 3000);
//         alert("❌ Connection failed: " + data.message);
//       }
//     } catch (err) {
//       setConnectionStatus('error');
//       setTimeout(() => setConnectionStatus('idle'), 3000);
//       alert("❌ Unable to test connection.");
//     }
//   };

//   const isConfigReady = emailConfig === 1 && emailSent === 1;
//   const isTestPending = emailConfig === 1 && emailSent === 0;

//   // Navigation sections
//   const sections = [
//     { id: 'basic', label: 'Basic Settings', icon: User },
//     { id: 'advanced', label: 'Advanced Settings', icon: Settings },
//     { id: 'smtp', label: 'SMTP', icon: Send },
//     { id: 'imap', label: 'IMAP', icon: Database },
//     { id: 'security', label: 'Security', icon: Shield },
//     { id: 'notifications', label: 'Notifications', icon: Bell },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-800/95 dark:to-gray-900">
//       <AnimatedBackground />
      
//       <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
//         {/* ============================================ */}
//         {/* ENHANCED HEADER WITH GLASS EFFECT */}
//         {/* ============================================ */}
//         <motion.div 
//           className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8 mb-8 border border-white/20 dark:border-gray-700/30 shadow-2xl"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="relative z-10">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
//               <div className="flex items-center gap-5">
//                 <motion.div 
//                   className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30"
//                   whileHover={{ rotate: 10, scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Mail className="h-8 w-8 text-white" />
//                 </motion.div>
//                 <div>
//                   <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
//                     Email Configuration
//                   </h1>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
//                     <Sparkles className="h-4 w-4 text-purple-500" />
//                     Configure your email settings for seamless communication
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap items-center gap-3">
//                 {/* Status Badge */}
//                 <motion.div 
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm font-medium
//                     ${isConfigReady 
//                       ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50'
//                       : emailConfig === 1
//                       ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50'
//                       : 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50'
//                     }`}
//                   animate={{ scale: [1, 1.05, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   {isConfigReady ? (
//                     <>
//                       <CheckCircle className="h-4 w-4" />
//                       <span>Ready</span>
//                     </>
//                   ) : emailConfig === 1 ? (
//                     <>
//                       <Clock className="h-4 w-4" />
//                       <span>Test Pending</span>
//                     </>
//                   ) : (
//                     <>
//                       <AlertCircle className="h-4 w-4" />
//                       <span>Setup Required</span>
//                     </>
//                   )}
//                 </motion.div>
                
//                 {/* Live Indicator */}
//                 <div className="flex items-center gap-2 px-4 py-2 bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/50 dark:border-green-800/50">
//                   <Zap className="h-4 w-4" />
//                   <span>Live</span>
//                   <span className="relative flex h-2 w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Decorative elements */}
//           <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
//           <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full blur-3xl" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
//         </motion.div>

//         {/* ============================================ */}
//         {/* ENHANCED STATUS CARDS */}
//         {/* ============================================ */}
//         <motion.div 
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <StatusCard
//             title="Configuration Status"
//             status={emailConfig === 1 ? 'success' : 'error'}
//             icon={Settings}
//             statusIcon={emailConfig === 1 ? CheckCircle : X}
//             color="from-emerald-500 to-green-500"
//             description={emailConfig === 1 ? "All settings configured" : "Please configure"}
//             value={emailConfig === 1 ? "✓" : "✗"}
//           />
          
//           <StatusCard
//             title="Test Email Status"
//             status={emailSent === 1 ? 'success' : emailConfig === 1 ? 'warning' : 'error'}
//             icon={Send}
//             statusIcon={emailSent === 1 ? CheckCircle : emailConfig === 1 ? Clock : X}
//             color={emailSent === 1 ? "from-emerald-500 to-green-500" : "from-amber-500 to-yellow-500"}
//             description={emailSent === 1 ? "Test sent successfully" : emailConfig === 1 ? "Ready to send" : "Configure first"}
//             value={emailSent === 1 ? "✓" : "⟳"}
//           />
          
//           <StatusCard
//             title="Connection Status"
//             status={connectionStatus === 'success' ? 'success' : connectionStatus === 'error' ? 'error' : 'warning'}
//             icon={Signal}
//             statusIcon={connectionStatus === 'success' ? CheckCircle : connectionStatus === 'error' ? AlertCircle : Radio}
//             color={connectionStatus === 'success' ? "from-emerald-500 to-green-500" : "from-amber-500 to-yellow-500"}
//             description={connectionStatus === 'success' ? "Connected" : connectionStatus === 'error' ? "Connection failed" : "Not tested"}
//             value={connectionStatus === 'success' ? "✓" : "?"}
//           />
          
//           <StatusCard
//             title="Overall Status"
//             status={isConfigReady ? 'success' : isTestPending ? 'warning' : 'error'}
//             icon={Shield}
//             statusIcon={isConfigReady ? Shield : isTestPending ? Clock : AlertCircle}
//             color={isConfigReady ? "from-emerald-500 to-green-500" : "from-amber-500 to-yellow-500"}
//             description={isConfigReady ? "Fully operational" : isTestPending ? "Test pending" : "Setup required"}
//             value={isConfigReady ? "✓" : "!"}
//           />
//         </motion.div>

//         {/* ============================================ */}
//         {/* MAIN CONFIGURATION FORM - ENHANCED */}
//         {/* ============================================ */}
//         <motion.div 
//           className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           {/* Form Header with Navigation */}
//           <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-gray-800/50 dark:to-gray-800/50">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
//                   <Settings className="h-5 w-5 text-blue-600" />
//                   Configuration Settings
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
//                   Configure your email server and preferences
//                 </p>
//               </div>
              
//               {/* Section Navigation */}
//               <div className="flex flex-wrap gap-2">
//                 {sections.map((section) => {
//                   const Icon = section.icon;
//                   return (
//                     <motion.button
//                       key={section.id}
//                       onClick={() => setActiveSection(section.id)}
//                       className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
//                         ${activeSection === section.id 
//                           ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
//                           : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50'
//                         }`}
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       <Icon className={`h-3.5 w-3.5 ${activeSection === section.id ? 'text-white' : 'text-gray-400'}`} />
//                       <span>{section.label}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Form Body */}
//           <div className="p-6 md:p-8">
//             <AnimatePresence mode="wait">
//               {/* Basic Settings */}
//               {activeSection === 'basic' && (
//                 <motion.div
//                   key="basic"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 md:grid-cols-2 gap-6"
//                 >
//                   <AnimatedInput
//                     label="Profile Name"
//                     icon={User}
//                     name="profileName"
//                     value={formData.profileName}
//                     onChange={handleChange}
//                     placeholder="e.g., Sales Department"
//                     required
//                   />
                  
//                   <AnimatedInput
//                     label="Display Name"
//                     icon={Building}
//                     name="displayName"
//                     value={formData.displayName}
//                     onChange={handleChange}
//                     placeholder="e.g., John Doe"
//                     required
//                   />
                  
//                   <AnimatedInput
//                     label="Email Address"
//                     icon={AtSign}
//                     name="emailAddress"
//                     value={formData.emailAddress}
//                     onChange={handleChange}
//                     placeholder="e.g., sales@company.com"
//                     type="email"
//                     required
//                   />
                  
//                   <AnimatedInput
//                     label="Phone Number"
//                     icon={Phone}
//                     name="phoneNumber"
//                     value={formData.phoneNumber}
//                     onChange={handleChange}
//                     placeholder="e.g., +1 234 567 8900"
//                     type="tel"
//                   />
//                 </motion.div>
//               )}

//               {/* Advanced Settings */}
//               {activeSection === 'advanced' && (
//                 <motion.div
//                   key="advanced"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-6"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <AnimatedInput
//                       label="Timezone"
//                       icon={Clock}
//                       name="timezone"
//                       value={formData.timezone}
//                       onChange={handleChange}
//                       placeholder="e.g., UTC, America/New_York"
//                     />
                    
//                     <AnimatedInput
//                       label="Language"
//                       icon={Globe}
//                       name="language"
//                       value={formData.language}
//                       onChange={handleChange}
//                       placeholder="e.g., en, es, fr"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       <MessageSquare className="h-4 w-4 text-blue-500" />
//                       Email Signature
//                     </label>
//                     <textarea
//                       name="signature"
//                       value={formData.signature}
//                       onChange={handleChange}
//                       placeholder="Enter your email signature..."
//                       rows={4}
//                       className="w-full border-2 rounded-xl px-4 py-3 
//                         bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
//                         transition-all duration-300 outline-none text-sm 
//                         border-gray-200/70 dark:border-gray-700/70 
//                         focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 
//                         shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10
//                         resize-none"
//                     />
//                   </div>
//                 </motion.div>
//               )}

//               {/* SMTP Settings */}
//               {activeSection === 'smtp' && (
//                 <motion.div
//                   key="smtp"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 md:grid-cols-2 gap-6"
//                 >
//                   <AnimatedInput
//                     label="SMTP Server"
//                     icon={Server}
//                     name="smtpServer"
//                     value={formData.smtpServer}
//                     onChange={handleChange}
//                     placeholder="e.g., smtp.gmail.com"
//                     required
//                   />
                  
//                   <AnimatedInput
//                     label="SMTP Port"
//                     icon={Server}
//                     name="smtpPort"
//                     value={formData.smtpPort}
//                     onChange={handleChange}
//                     placeholder="e.g., 587"
//                     type="number"
//                     required
//                   />
                  
//                   <AnimatedInput
//                     label="SMTP Username"
//                     icon={User}
//                     name="smtpUsername"
//                     value={formData.smtpUsername}
//                     onChange={handleChange}
//                     placeholder="e.g., username@gmail.com"
//                     required
//                   />
                  
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       <Lock className="h-4 w-4 text-blue-500" />
//                       SMTP Password
//                       <span className="text-red-500 text-lg">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur transition-opacity duration-300 opacity-0 group-hover:opacity-50" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         name="smtpPassword"
//                         value={formData.smtpPassword}
//                         onChange={handleChange}
//                         className="relative w-full border-2 rounded-xl px-4 py-3 
//                           bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
//                           transition-all duration-300 outline-none text-sm 
//                           border-gray-200/70 dark:border-gray-700/70 
//                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 
//                           shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10
//                           pr-12"
//                         placeholder="Enter password"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-4 w-4" />
//                         ) : (
//                           <Eye className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       <Shield className="h-4 w-4 text-blue-500" />
//                       Encryption
//                     </label>
//                     <select
//                       name="smtpEncryption"
//                       value={formData.smtpEncryption}
//                       onChange={handleChange}
//                       className="w-full border-2 rounded-xl px-4 py-3 
//                         bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
//                         transition-all duration-300 outline-none text-sm 
//                         border-gray-200/70 dark:border-gray-700/70 
//                         focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 
//                         shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10"
//                     >
//                       <option value="TLS">TLS (Recommended)</option>
//                       <option value="SSL">SSL</option>
//                       <option value="STARTTLS">STARTTLS</option>
//                       <option value="None">None (Not Recommended)</option>
//                     </select>
//                   </div>
//                 </motion.div>
//               )}

//               {/* IMAP Settings */}
//               {activeSection === 'imap' && (
//                 <motion.div
//                   key="imap"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="grid grid-cols-1 md:grid-cols-2 gap-6"
//                 >
//                   <AnimatedInput
//                     label="IMAP Server"
//                     icon={Database}
//                     name="imapServer"
//                     value={formData.imapServer}
//                     onChange={handleChange}
//                     placeholder="e.g., imap.gmail.com"
//                   />
                  
//                   <AnimatedInput
//                     label="IMAP Port"
//                     icon={Database}
//                     name="imapPort"
//                     value={formData.imapPort}
//                     onChange={handleChange}
//                     placeholder="e.g., 993"
//                     type="number"
//                   />
                  
//                   <AnimatedInput
//                     label="IMAP Username"
//                     icon={User}
//                     name="imapUsername"
//                     value={formData.imapUsername}
//                     onChange={handleChange}
//                     placeholder="e.g., username@gmail.com"
//                   />
                  
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       <Lock className="h-4 w-4 text-blue-500" />
//                       IMAP Password
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur transition-opacity duration-300 opacity-0 group-hover:opacity-50" />
//                       <input
//                         type={showImapPassword ? "text" : "password"}
//                         name="imapPassword"
//                         value={formData.imapPassword}
//                         onChange={handleChange}
//                         className="relative w-full border-2 rounded-xl px-4 py-3 
//                           bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
//                           transition-all duration-300 outline-none text-sm 
//                           border-gray-200/70 dark:border-gray-700/70 
//                           focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 
//                           shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10
//                           pr-12"
//                         placeholder="Enter password"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowImapPassword(!showImapPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
//                       >
//                         {showImapPassword ? (
//                           <EyeOff className="h-4 w-4" />
//                         ) : (
//                           <Eye className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {/* Security Settings */}
//               {activeSection === 'security' && (
//                 <motion.div
//                   key="security"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-4"
//                 >
//                   <ToggleSwitch
//                     label="Two-Factor Authentication"
//                     enabled={formData.twoFactorAuth}
//                     onChange={(value: boolean) => handleToggle('twoFactorAuth', value)}
//                     icon={Fingerprint}
//                   />
                  
//                   <ToggleSwitch
//                     label="IP Whitelisting"
//                     enabled={formData.ipWhitelisting}
//                     onChange={(value: boolean) => handleToggle('ipWhitelisting', value)}
//                     icon={ShieldCheck}
//                   />
                  
//                   <ToggleSwitch
//                     label="SSL Verification"
//                     enabled={formData.sslVerification}
//                     onChange={(value: boolean) => handleToggle('sslVerification', value)}
//                     icon={Lock}
//                   />
                  
//                   <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
//                     <div className="flex items-start gap-3">
//                       <ShieldAlert className="h-5 w-5 text-blue-500 mt-0.5" />
//                       <div>
//                         <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Security Recommendations</p>
//                         <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
//                           • Use strong passwords with at least 12 characters<br />
//                           • Enable two-factor authentication for added security<br />
//                           • Keep your SSL verification enabled for secure connections
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {/* Notifications Settings */}
//               {activeSection === 'notifications' && (
//                 <motion.div
//                   key="notifications"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="space-y-4"
//                 >
//                   <ToggleSwitch
//                     label="Email Notifications"
//                     enabled={formData.emailNotifications}
//                     onChange={(value: boolean) => handleToggle('emailNotifications', value)}
//                     icon={Bell}
//                   />
                  
//                   <ToggleSwitch
//                     label="Daily Digest"
//                     enabled={formData.dailyDigest}
//                     onChange={(value: boolean) => handleToggle('dailyDigest', value)}
//                     icon={Calendar}
//                   />
                  
//                   <ToggleSwitch
//                     label="Alerts Enabled"
//                     enabled={formData.alertsEnabled}
//                     onChange={(value: boolean) => handleToggle('alertsEnabled', value)}
//                     icon={BellRing}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Status Messages */}
//             <motion.div 
//               className="mt-6 space-y-3"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               {emailConfig === 0 && (
//                 <motion.div 
//                   className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl border border-red-200/50 dark:border-red-800/30 backdrop-blur-sm"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                   <p className="text-sm text-red-700 dark:text-red-300 font-medium">
//                     ⚠️ Please save configuration first before sending test email.
//                   </p>
//                 </motion.div>
//               )}

//               {isConfigReady && (
//                 <motion.div 
//                   className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-sm"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
//                   <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
//                     ✅ Test email already sent successfully. Your configuration is working!
//                   </p>
//                 </motion.div>
//               )}

//               {isTestPending && (
//                 <motion.div 
//                   className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm"
//                   initial={{ scale: 0.95 }}
//                   animate={{ scale: 1 }}
//                 >
//                   <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
//                   <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
//                     ⏳ Configuration is ready. Click "Send Test Mail" to verify your settings.
//                   </p>
//                 </motion.div>
//               )}

//               {/* Connection Status */}
//               {connectionStatus !== 'idle' && (
//                 <motion.div 
//                   className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm
//                     ${connectionStatus === 'testing' || connectionStatus === 'connecting' || connectionStatus === 'authenticating' || connectionStatus === 'sending'
//                       ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30'
//                       : connectionStatus === 'success'
//                       ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30'
//                       : 'bg-red-50/50 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/30'
//                     }`}
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   {connectionStatus === 'testing' || connectionStatus === 'connecting' || connectionStatus === 'authenticating' || connectionStatus === 'sending' ? (
//                     <>
//                       <RefreshCw className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
//                       <p className="text-sm text-blue-700 dark:text-blue-300 font-medium capitalize">
//                         {connectionStatus === 'testing' ? 'Testing connection...' :
//                          connectionStatus === 'connecting' ? 'Connecting to server...' :
//                          connectionStatus === 'authenticating' ? 'Authenticating...' :
//                          'Sending test email...'}
//                       </p>
//                     </>
//                   ) : connectionStatus === 'success' ? (
//                     <>
//                       <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
//                       <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
//                         ✅ Connection successful!
//                       </p>
//                     </>
//                   ) : (
//                     <>
//                       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                       <p className="text-sm text-red-700 dark:text-red-300 font-medium">
//                         ❌ Connection failed. Please check your settings.
//                       </p>
//                     </>
//                   )}
//                 </motion.div>
//               )}
//             </motion.div>

//             {/* Action Buttons - Enhanced */}
//             <motion.div 
//               className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <motion.button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-6 py-3 
//                   bg-gradient-to-r from-blue-600 to-indigo-600 
//                   hover:from-blue-700 hover:to-indigo-700 
//                   text-white rounded-xl font-semibold 
//                   shadow-lg hover:shadow-xl 
//                   transition-all duration-300 
//                   disabled:opacity-50 disabled:cursor-not-allowed 
//                   text-sm"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="h-4 w-4 animate-spin" />
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     <span>Save Configuration</span>
//                   </>
//                 )}
//               </motion.button>

//               <motion.button
//                 onClick={testConnection}
//                 disabled={loading || emailConfig !== 1}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
//                   ${emailConfig !== 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-500"
//                     : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
//                   }`}
//                 whileHover={emailConfig === 1 ? { scale: 1.02 } : {}}
//                 whileTap={emailConfig === 1 ? { scale: 0.98 } : {}}
//               >
//                 <Signal className="h-4 w-4" />
//                 <span>Test Connection</span>
//               </motion.button>

//               <motion.button
//                 onClick={sendTestMail}
//                 disabled={emailConfig !== 1 || emailSent === 1 || sendingTest}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
//                   ${emailConfig !== 1 || emailSent === 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700/50 dark:text-gray-500"
//                     : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
//                   }`}
//                 whileHover={emailConfig === 1 && emailSent === 0 ? { scale: 1.02 } : {}}
//                 whileTap={emailConfig === 1 && emailSent === 0 ? { scale: 0.98 } : {}}
//               >
//                 {sendingTest ? (
//                   <>
//                     <RefreshCw className="h-4 w-4 animate-spin" />
//                     <span>Sending...</span>
//                   </>
//                 ) : emailSent === 1 ? (
//                   <>
//                     <CheckCircle className="h-4 w-4" />
//                     <span>Test Sent ✓</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4" />
//                     <span>Send Test Mail</span>
//                   </>
//                 )}
//               </motion.button>

//               {isConfigReady && (
//                 <motion.span 
//                   className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 ml-2"
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.2 }}
//                 >
//                   <Sparkles className="h-4 w-4 animate-pulse" />
//                   <span>✨ Ready to send emails</span>
//                 </motion.span>
//               )}
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* ============================================ */}
//         {/* ENHANCED FOOTER */}
//         {/* ============================================ */}
//         <motion.div 
//           className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//         >
//           <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
//             <Clock className="h-4 w-4" />
//             <span>Last updated: {new Date().toLocaleString()}</span>
//             <span className="w-px h-4 bg-gray-300/50 dark:bg-gray-700/50" />
//             <span>Secure connection</span>
//             <span className="w-px h-4 bg-gray-300/50 dark:bg-gray-700/50" />
//             <span>Version 2.0</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                 System Online
//               </span>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
//               <span className="flex items-center gap-1.5">
//                 <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
//                 v2.0.0
//               </span>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import { API_URL, ACTIVITY_URL } from "@/components/api";
import { 
  Mail, Settings, Save, Send, CheckCircle, AlertCircle,
  User, AtSign, Server, Lock, Key, Shield, 
  Globe, Database, RefreshCw, Sparkles, 
  Building, Phone, MapPin, Clock, Activity,
  ChevronRight, ArrowRight, Check, X, 
  Zap, Rocket, Crown, Gem, Star, Award,
  Layers, Grid, List, SlidersHorizontal,
  Play, Pause, Maximize2, Minimize2,
  Circle, Gauge, Target, TrendingUp,
  BarChart3, PieChart, LineChart,
  Cloud, Wifi, Signal, Cpu, HardDrive,
  ShieldCheck, Fingerprint, ScanEye,
  Box, Package, Layers3, ZapOff,
  Timer, Calendar, MessageSquare,
  Bell, BellRing, AlertTriangle,
  ShieldAlert, Radio, Antenna
} from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// ANIMATED BACKGROUND PARTICLES - ENHANCED
// ============================================
const AnimatedBackground = () => {
  const [particles] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.2 + 0.05,
      color: ['from-[#8EE147]/10', 'from-[#6EC035]/10', 'from-[#5AA82E]/10', 'from-[#0E223B]/10', 'from-[#1A3355]/10'][Math.floor(Math.random() * 5)]
    }))
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full bg-gradient-to-r ${p.color} to-transparent`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6EC035]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8EE147]/5 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(142,225,71,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

// ============================================
// ACTIVITY LOG HELPERS
// ============================================
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
};

const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '127.0.0.1';
  }
};

const createActivityLog = async (actionId: number, moduleId: number, description: string, additionalData?: any) => {
  try {
    const seller = JSON.parse(localStorage.getItem("seller") || "{}");
    const ipAddress = await getIPAddress();
    const device = getDeviceInfo();

    const logData = {
      userId: seller.id || 1,
      userName: seller.name || seller.email || 'Unknown',
      role: seller.role || 'seller',
      action_id: actionId,
      module_id: moduleId,
      description: description,
      ipAddress,
      device,
      status: 'SUCCESS',
      ...additionalData
    };

    const response = await fetch(`${ACTIVITY_URL}/api/activity-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    const result = await response.json();
    if (!result.success) {
      console.error('Failed to create activity log:', result.message);
    }
    return result;
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

// ============================================
// ENHANCED STATUS CARD - Updated with new colors
// ============================================
const StatusCard = ({ title, status, icon: Icon, statusIcon: StatusIcon, color, description, value }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative group"
    >
      <div 
        className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-500 cursor-pointer
          ${status === 'success' ? 'border-[#8EE147]/30 bg-gradient-to-br from-[#8EE147]/20 via-[#6EC035]/10 to-[#0E223B]/50 dark:from-[#8EE147]/10 dark:via-[#6EC035]/5 dark:to-[#0E223B]/80' :
            status === 'warning' ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-[#0E223B]/50 dark:from-amber-500/10 dark:via-yellow-500/5 dark:to-[#0E223B]/80' :
            status === 'error' ? 'border-red-500/30 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-[#0E223B]/50 dark:from-red-500/10 dark:via-rose-500/5 dark:to-[#0E223B]/80' :
            'border-white/10 bg-gradient-to-br from-[#0E223B]/80 to-[#1A3355]/80'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glassmorphism glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        
        <motion.div
          className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 blur-2xl`}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-2.5 rounded-xl
                  ${status === 'success' ? 'bg-[#8EE147]/20 dark:bg-[#8EE147]/10' :
                    status === 'warning' ? 'bg-amber-500/20 dark:bg-amber-500/10' :
                    status === 'error' ? 'bg-red-500/20 dark:bg-red-500/10' :
                    'bg-white/5'}`}
                animate={{ 
                  rotate: isHovered ? [0, -5, 5, 0] : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <Icon className={`h-5 w-5
                  ${status === 'success' ? 'text-[#8EE147]' :
                    status === 'warning' ? 'text-amber-400' :
                    status === 'error' ? 'text-red-400' :
                    'text-slate-400'}`}
                />
              </motion.div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {title}
                </p>
                {value && (
                  <p className="text-lg font-bold text-white">
                    {value}
                  </p>
                )}
              </div>
            </div>
            
            {StatusIcon && (
              <StatusIcon className={`h-5 w-5 flex-shrink-0
                ${status === 'success' ? 'text-[#8EE147]' :
                  status === 'warning' ? 'text-amber-400' :
                  status === 'error' ? 'text-red-400' :
                  'text-slate-400'}`}
              />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold
              ${status === 'success' ? 'text-[#8EE147]' :
                status === 'warning' ? 'text-amber-400' :
                status === 'error' ? 'text-red-400' :
                'text-slate-400'}`}
            >
              {status === 'success' ? '✓ Configured' :
               status === 'warning' ? '⟳ Pending' :
               status === 'error' ? '✕ Setup Required' :
               '— Not Configured'}
            </p>
            {description && (
              <p className="text-xs text-slate-500 truncate max-w-[140px]">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Animated progress bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: status === 'success' ? 1 : status === 'warning' ? 0.5 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ transformOrigin: 'left' }}
        >
          <motion.div 
            className={`h-full bg-gradient-to-r ${color}`}
            animate={{ 
              width: status === 'success' ? '100%' : status === 'warning' ? '50%' : '0%' 
            }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// ENHANCED INPUT FIELD WITH GLASS EFFECT - Updated with new colors
// ============================================
const AnimatedInput = ({ label, icon: Icon, name, value, onChange, placeholder, type = "text", className = "", required = false, helper = "" }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  useEffect(() => {
    setHasValue(value?.length > 0);
  }, [value]);
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Icon className="h-4 w-4 text-[#8EE147]" />
        {label}
        {required && <span className="text-red-400 text-lg">*</span>}
      </label>
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 rounded-xl blur transition-opacity duration-300
          ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`relative w-full border-2 rounded-xl px-4 py-3 
            bg-[#0E223B]/80 dark:bg-[#0E223B]/80 backdrop-blur-sm 
            transition-all duration-300 outline-none text-sm text-white
            placeholder:text-slate-500
            ${isFocused 
              ? 'border-[#8EE147] ring-2 ring-[#8EE147]/30 shadow-lg shadow-[#8EE147]/20' 
              : 'border-white/10 hover:border-white/20'
            } ${hasValue ? 'border-[#8EE147]/50' : ''} ${className}`}
        />
        {hasValue && (
          <motion.div 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle className="h-4 w-4 text-[#8EE147]" />
          </motion.div>
        )}
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E]"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>
      {helper && (
        <p className="text-xs text-slate-500 mt-1">{helper}</p>
      )}
    </motion.div>
  );
};

// ============================================
// TOGGLE SWITCH COMPONENT - Updated with new colors
// ============================================
const ToggleSwitch = ({ label, enabled, onChange, icon: Icon }: any) => {
  return (
    <motion.div 
      className="flex items-center justify-between p-4 bg-[#0E223B]/50 rounded-xl border border-white/10"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-[#8EE147]" />}
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <motion.button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          enabled ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035]' : 'bg-white/20'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
          animate={{ x: enabled ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT - ENHANCED
// ============================================
export default function EmailConfiguration() {
  const [formData, setFormData] = useState({
    // Basic Settings
    profileName: "",
    displayName: "",
    emailAddress: "",
    phoneNumber: "",
    
    // Advanced Settings
    timezone: "",
    language: "",
    signature: "",
    
    // SMTP Settings
    smtpServer: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "TLS",
    
    // IMAP Settings
    imapServer: "",
    imapPort: "",
    imapUsername: "",
    imapPassword: "",
    
    // Security Settings
    twoFactorAuth: false,
    ipWhitelisting: false,
    sslVerification: true,
    
    // Notification Settings
    emailNotifications: true,
    dailyDigest: false,
    alertsEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState(0);
  const [emailSent, setEmailSent] = useState(0);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showImapPassword, setShowImapPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [connectionStatus, setConnectionStatus] = useState('idle');

  useEffect(() => {
    fetchConfig();
    createActivityLog(39, 12, 'Viewed email configuration page');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchConfig = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`);
      const data = await response.json();

      if (data.success) {
        setEmailConfig(data.data.email_config);
        setEmailSent(data.data.email_sent);
        setFormData({
          profileName: data.data.profile_name || "",
          displayName: data.data.display_name || "",
          emailAddress: data.data.email_address || "",
          phoneNumber: data.data.phone_number || "",
          timezone: data.data.timezone || "UTC",
          language: data.data.language || "en",
          signature: data.data.signature || "",
          smtpServer: data.data.smtp_server || "",
          smtpPort: data.data.smtp_port || "",
          smtpUsername: data.data.smtp_username || "",
          smtpPassword: data.data.smtp_password || "",
          smtpEncryption: data.data.smtp_encryption || "TLS",
          imapServer: data.data.imap_server || "",
          imapPort: data.data.imap_port || "",
          imapUsername: data.data.imap_username || "",
          imapPassword: data.data.imap_password || "",
          twoFactorAuth: data.data.two_factor_auth || false,
          ipWhitelisting: data.data.ip_whitelisting || false,
          sslVerification: data.data.ssl_verification !== false,
          emailNotifications: data.data.email_notifications !== false,
          dailyDigest: data.data.daily_digest || false,
          alertsEnabled: data.data.alerts_enabled !== false,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");

      await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
        profile_name: formData.profileName,
        email_address: formData.emailAddress
      });

      const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setEmailConfig(1);
        alert("✅ Configuration updated successfully");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("❌ Failed to update configuration");
    } finally {
      setLoading(false);
    }
  };

  const sendTestMail = async () => {
    try {
      setSendingTest(true);
      setConnectionStatus('connecting');
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
      setTimeout(() => setConnectionStatus('authenticating'), 1000);
      setTimeout(() => setConnectionStatus('sending'), 2000);
      
      const response = await fetch(`${API_URL}/api/send-test-email/${seller.id}`, {
        method: "POST"
      });
      const data = await response.json();
      
      if (data.success) {
        setEmailSent(1);
        setConnectionStatus('success');
        setTimeout(() => setConnectionStatus('idle'), 3000);
        alert("✅ Test Email Sent Successfully!");
      } else {
        setConnectionStatus('error');
        setTimeout(() => setConnectionStatus('idle'), 3000);
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      setConnectionStatus('error');
      setTimeout(() => setConnectionStatus('idle'), 3000);
      alert("❌ Unable to send email.");
    } finally {
      setSendingTest(false);
    }
  };

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      const seller = JSON.parse(localStorage.getItem("seller") || "{}");
      
      const response = await fetch(`${API_URL}/api/test-connection/${seller.id}`, {
        method: "GET"
      });
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
        setTimeout(() => setConnectionStatus('idle'), 3000);
        alert("✅ Connection successful!");
      } else {
        setConnectionStatus('error');
        setTimeout(() => setConnectionStatus('idle'), 3000);
        alert("❌ Connection failed: " + data.message);
      }
    } catch (err) {
      setConnectionStatus('error');
      setTimeout(() => setConnectionStatus('idle'), 3000);
      alert("❌ Unable to test connection.");
    }
  };

  const isConfigReady = emailConfig === 1 && emailSent === 1;
  const isTestPending = emailConfig === 1 && emailSent === 0;

  // Navigation sections
  const sections = [
    { id: 'basic', label: 'Basic Settings', icon: User },
    { id: 'advanced', label: 'Advanced Settings', icon: Settings },
    { id: 'smtp', label: 'SMTP', icon: Send },
    { id: 'imap', label: 'IMAP', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#0E223B]">
      <AnimatedBackground />
      
      <div className="relative p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* ============================================ */}
        {/* ENHANCED HEADER WITH GLASS EFFECT */}
        {/* ============================================ */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E223B] via-[#1A3355] to-[#0E223B] backdrop-blur-xl p-8 mb-8 border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div 
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#8EE147] to-[#6EC035] shadow-xl shadow-[#8EE147]/30"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="h-8 w-8 text-[#0E223B]" />
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#8EE147] via-[#6EC035] to-[#5AA82E] bg-clip-text text-transparent">
                    Email Configuration
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#8EE147]" />
                    Configure your email settings for seamless communication
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Badge */}
                <motion.div 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border text-sm font-medium
                    ${isConfigReady 
                      ? 'bg-[#8EE147]/20 text-[#8EE147] border-[#8EE147]/30'
                      : emailConfig === 1
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isConfigReady ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Ready</span>
                    </>
                  ) : emailConfig === 1 ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Test Pending</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>Setup Required</span>
                    </>
                  )}
                </motion.div>
                
                {/* Live Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#8EE147]/20 text-[#8EE147] rounded-full text-sm font-medium backdrop-blur-sm border border-[#8EE147]/30">
                  <Zap className="h-4 w-4" />
                  <span>Live</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8EE147] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8EE147]"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#8EE147]/5 to-[#6EC035]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#5AA82E]/5 to-[#8EE147]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8EE147]/5 rounded-full blur-3xl" />
        </motion.div>

        {/* ============================================ */}
        {/* ENHANCED STATUS CARDS - Updated */}
        {/* ============================================ */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatusCard
            title="Configuration Status"
            status={emailConfig === 1 ? 'success' : 'error'}
            icon={Settings}
            statusIcon={emailConfig === 1 ? CheckCircle : X}
            color="from-[#8EE147] to-[#6EC035]"
            description={emailConfig === 1 ? "All settings configured" : "Please configure"}
            value={emailConfig === 1 ? "✓" : "✗"}
          />
          
          <StatusCard
            title="Test Email Status"
            status={emailSent === 1 ? 'success' : emailConfig === 1 ? 'warning' : 'error'}
            icon={Send}
            statusIcon={emailSent === 1 ? CheckCircle : emailConfig === 1 ? Clock : X}
            color={emailSent === 1 ? "from-[#8EE147] to-[#6EC035]" : "from-amber-500 to-yellow-500"}
            description={emailSent === 1 ? "Test sent successfully" : emailConfig === 1 ? "Ready to send" : "Configure first"}
            value={emailSent === 1 ? "✓" : "⟳"}
          />
          
          <StatusCard
            title="Connection Status"
            status={connectionStatus === 'success' ? 'success' : connectionStatus === 'error' ? 'error' : 'warning'}
            icon={Signal}
            statusIcon={connectionStatus === 'success' ? CheckCircle : connectionStatus === 'error' ? AlertCircle : Radio}
            color={connectionStatus === 'success' ? "from-[#8EE147] to-[#6EC035]" : "from-amber-500 to-yellow-500"}
            description={connectionStatus === 'success' ? "Connected" : connectionStatus === 'error' ? "Connection failed" : "Not tested"}
            value={connectionStatus === 'success' ? "✓" : "?"}
          />
          
          <StatusCard
            title="Overall Status"
            status={isConfigReady ? 'success' : isTestPending ? 'warning' : 'error'}
            icon={Shield}
            statusIcon={isConfigReady ? Shield : isTestPending ? Clock : AlertCircle}
            color={isConfigReady ? "from-[#8EE147] to-[#6EC035]" : "from-amber-500 to-yellow-500"}
            description={isConfigReady ? "Fully operational" : isTestPending ? "Test pending" : "Setup required"}
            value={isConfigReady ? "✓" : "!"}
          />
        </motion.div>

        {/* ============================================ */}
        {/* MAIN CONFIGURATION FORM - ENHANCED */}
        {/* ============================================ */}
        <motion.div 
          className="bg-[#0E223B]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Form Header with Navigation */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#0E223B] to-[#1A3355]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#8EE147] to-[#6EC035] bg-clip-text text-transparent flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#8EE147]" />
                  Configuration Settings
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Configure your email server and preferences
                </p>
              </div>
              
              {/* Section Navigation */}
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
                        ${activeSection === section.id 
                          ? 'bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] shadow-lg shadow-[#8EE147]/25' 
                          : 'bg-[#0E223B]/50 text-slate-400 hover:bg-[#1A3355] border border-white/10'
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`h-3.5 w-3.5 ${activeSection === section.id ? 'text-[#0E223B]' : 'text-slate-400'}`} />
                      <span>{section.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Basic Settings */}
              {activeSection === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <AnimatedInput
                    label="Profile Name"
                    icon={User}
                    name="profileName"
                    value={formData.profileName}
                    onChange={handleChange}
                    placeholder="e.g., Sales Department"
                    required
                  />
                  
                  <AnimatedInput
                    label="Display Name"
                    icon={Building}
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                  
                  <AnimatedInput
                    label="Email Address"
                    icon={AtSign}
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    placeholder="e.g., sales@company.com"
                    type="email"
                    required
                  />
                  
                  <AnimatedInput
                    label="Phone Number"
                    icon={Phone}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g., +1 234 567 8900"
                    type="tel"
                  />
                </motion.div>
              )}

              {/* Advanced Settings */}
              {activeSection === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatedInput
                      label="Timezone"
                      icon={Clock}
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      placeholder="e.g., UTC, America/New_York"
                    />
                    
                    <AnimatedInput
                      label="Language"
                      icon={Globe}
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="e.g., en, es, fr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <MessageSquare className="h-4 w-4 text-[#8EE147]" />
                      Email Signature
                    </label>
                    <textarea
                      name="signature"
                      value={formData.signature}
                      onChange={handleChange}
                      placeholder="Enter your email signature..."
                      rows={4}
                      className="w-full border-2 rounded-xl px-4 py-3 
                        bg-[#0E223B]/80 backdrop-blur-sm 
                        transition-all duration-300 outline-none text-sm text-white
                        border-white/10 hover:border-white/20
                        focus:border-[#8EE147] focus:ring-2 focus:ring-[#8EE147]/30 
                        shadow-lg shadow-[#8EE147]/20
                        resize-none placeholder:text-slate-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* SMTP Settings */}
              {activeSection === 'smtp' && (
                <motion.div
                  key="smtp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <AnimatedInput
                    label="SMTP Server"
                    icon={Server}
                    name="smtpServer"
                    value={formData.smtpServer}
                    onChange={handleChange}
                    placeholder="e.g., smtp.gmail.com"
                    required
                  />
                  
                  <AnimatedInput
                    label="SMTP Port"
                    icon={Server}
                    name="smtpPort"
                    value={formData.smtpPort}
                    onChange={handleChange}
                    placeholder="e.g., 587"
                    type="number"
                    required
                  />
                  
                  <AnimatedInput
                    label="SMTP Username"
                    icon={User}
                    name="smtpUsername"
                    value={formData.smtpUsername}
                    onChange={handleChange}
                    placeholder="e.g., username@gmail.com"
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Lock className="h-4 w-4 text-[#8EE147]" />
                      SMTP Password
                      <span className="text-red-400 text-lg">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 rounded-xl blur transition-opacity duration-300 opacity-0 group-hover:opacity-50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="smtpPassword"
                        value={formData.smtpPassword}
                        onChange={handleChange}
                        className="relative w-full border-2 rounded-xl px-4 py-3 
                          bg-[#0E223B]/80 backdrop-blur-sm 
                          transition-all duration-300 outline-none text-sm text-white
                          border-white/10 hover:border-white/20
                          focus:border-[#8EE147] focus:ring-2 focus:ring-[#8EE147]/30 
                          shadow-lg shadow-[#8EE147]/20
                          pr-12 placeholder:text-slate-500"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Shield className="h-4 w-4 text-[#8EE147]" />
                      Encryption
                    </label>
                    <select
                      name="smtpEncryption"
                      value={formData.smtpEncryption}
                      onChange={handleChange}
                      className="w-full border-2 rounded-xl px-4 py-3 
                        bg-[#0E223B]/80 backdrop-blur-sm 
                        transition-all duration-300 outline-none text-sm text-white
                        border-white/10 hover:border-white/20
                        focus:border-[#8EE147] focus:ring-2 focus:ring-[#8EE147]/30 
                        shadow-lg shadow-[#8EE147]/20"
                    >
                      <option value="TLS">TLS (Recommended)</option>
                      <option value="SSL">SSL</option>
                      <option value="STARTTLS">STARTTLS</option>
                      <option value="None">None (Not Recommended)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* IMAP Settings */}
              {activeSection === 'imap' && (
                <motion.div
                  key="imap"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <AnimatedInput
                    label="IMAP Server"
                    icon={Database}
                    name="imapServer"
                    value={formData.imapServer}
                    onChange={handleChange}
                    placeholder="e.g., imap.gmail.com"
                  />
                  
                  <AnimatedInput
                    label="IMAP Port"
                    icon={Database}
                    name="imapPort"
                    value={formData.imapPort}
                    onChange={handleChange}
                    placeholder="e.g., 993"
                    type="number"
                  />
                  
                  <AnimatedInput
                    label="IMAP Username"
                    icon={User}
                    name="imapUsername"
                    value={formData.imapUsername}
                    onChange={handleChange}
                    placeholder="e.g., username@gmail.com"
                  />
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <Lock className="h-4 w-4 text-[#8EE147]" />
                      IMAP Password
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8EE147]/20 to-[#6EC035]/20 rounded-xl blur transition-opacity duration-300 opacity-0 group-hover:opacity-50" />
                      <input
                        type={showImapPassword ? "text" : "password"}
                        name="imapPassword"
                        value={formData.imapPassword}
                        onChange={handleChange}
                        className="relative w-full border-2 rounded-xl px-4 py-3 
                          bg-[#0E223B]/80 backdrop-blur-sm 
                          transition-all duration-300 outline-none text-sm text-white
                          border-white/10 hover:border-white/20
                          focus:border-[#8EE147] focus:ring-2 focus:ring-[#8EE147]/30 
                          shadow-lg shadow-[#8EE147]/20
                          pr-12 placeholder:text-slate-500"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImapPassword(!showImapPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showImapPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <ToggleSwitch
                    label="Two-Factor Authentication"
                    enabled={formData.twoFactorAuth}
                    onChange={(value: boolean) => handleToggle('twoFactorAuth', value)}
                    icon={Fingerprint}
                  />
                  
                  <ToggleSwitch
                    label="IP Whitelisting"
                    enabled={formData.ipWhitelisting}
                    onChange={(value: boolean) => handleToggle('ipWhitelisting', value)}
                    icon={ShieldCheck}
                  />
                  
                  <ToggleSwitch
                    label="SSL Verification"
                    enabled={formData.sslVerification}
                    onChange={(value: boolean) => handleToggle('sslVerification', value)}
                    icon={Lock}
                  />
                  
                  <div className="p-4 bg-[#8EE147]/10 rounded-xl border border-[#8EE147]/20">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-[#8EE147] mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#8EE147]">Security Recommendations</p>
                        <p className="text-xs text-slate-400 mt-1">
                          • Use strong passwords with at least 12 characters<br />
                          • Enable two-factor authentication for added security<br />
                          • Keep your SSL verification enabled for secure connections
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <ToggleSwitch
                    label="Email Notifications"
                    enabled={formData.emailNotifications}
                    onChange={(value: boolean) => handleToggle('emailNotifications', value)}
                    icon={Bell}
                  />
                  
                  <ToggleSwitch
                    label="Daily Digest"
                    enabled={formData.dailyDigest}
                    onChange={(value: boolean) => handleToggle('dailyDigest', value)}
                    icon={Calendar}
                  />
                  
                  <ToggleSwitch
                    label="Alerts Enabled"
                    enabled={formData.alertsEnabled}
                    onChange={(value: boolean) => handleToggle('alertsEnabled', value)}
                    icon={BellRing}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Messages */}
            <motion.div 
              className="mt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {emailConfig === 0 && (
                <motion.div 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/20 backdrop-blur-sm"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400 font-medium">
                    ⚠️ Please save configuration first before sending test email.
                  </p>
                </motion.div>
              )}

              {isConfigReady && (
                <motion.div 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#8EE147]/10 to-[#6EC035]/10 rounded-2xl border border-[#8EE147]/20 backdrop-blur-sm"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle className="h-5 w-5 text-[#8EE147] flex-shrink-0" />
                  <p className="text-sm text-[#8EE147] font-medium">
                    ✅ Test email already sent successfully. Your configuration is working!
                  </p>
                </motion.div>
              )}

              {isTestPending && (
                <motion.div 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/20 backdrop-blur-sm"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-400 font-medium">
                    ⏳ Configuration is ready. Click "Send Test Mail" to verify your settings.
                  </p>
                </motion.div>
              )}

              {/* Connection Status */}
              {connectionStatus !== 'idle' && (
                <motion.div 
                  className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm
                    ${connectionStatus === 'testing' || connectionStatus === 'connecting' || connectionStatus === 'authenticating' || connectionStatus === 'sending'
                      ? 'bg-blue-500/10 border-blue-500/20'
                      : connectionStatus === 'success'
                      ? 'bg-[#8EE147]/10 border-[#8EE147]/20'
                      : 'bg-red-500/10 border-red-500/20'
                    }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {connectionStatus === 'testing' || connectionStatus === 'connecting' || connectionStatus === 'authenticating' || connectionStatus === 'sending' ? (
                    <>
                      <RefreshCw className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0" />
                      <p className="text-sm text-blue-400 font-medium capitalize">
                        {connectionStatus === 'testing' ? 'Testing connection...' :
                         connectionStatus === 'connecting' ? 'Connecting to server...' :
                         connectionStatus === 'authenticating' ? 'Authenticating...' :
                         'Sending test email...'}
                      </p>
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-[#8EE147] flex-shrink-0" />
                      <p className="text-sm text-[#8EE147] font-medium">
                        ✅ Connection successful!
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400 font-medium">
                        ❌ Connection failed. Please check your settings.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Action Buttons - Enhanced */}
            <motion.div 
              className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 
                  bg-gradient-to-r from-[#8EE147] to-[#6EC035] 
                  hover:from-[#7DD13A] hover:to-[#5AA82E] 
                  text-[#0E223B] rounded-xl font-semibold 
                  shadow-lg shadow-[#8EE147]/25 hover:shadow-xl 
                  transition-all duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={testConnection}
                disabled={loading || emailConfig !== 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${emailConfig !== 1
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                whileHover={emailConfig === 1 ? { scale: 1.02 } : {}}
                whileTap={emailConfig === 1 ? { scale: 0.98 } : {}}
              >
                <Signal className="h-4 w-4" />
                <span>Test Connection</span>
              </motion.button>

              <motion.button
                onClick={sendTestMail}
                disabled={emailConfig !== 1 || emailSent === 1 || sendingTest}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${emailConfig !== 1 || emailSent === 1
                    ? "bg-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#8EE147] to-[#6EC035] hover:from-[#7DD13A] hover:to-[#5AA82E] text-[#0E223B] shadow-lg shadow-[#8EE147]/25 hover:shadow-xl"
                  }`}
                whileHover={emailConfig === 1 && emailSent === 0 ? { scale: 1.02 } : {}}
                whileTap={emailConfig === 1 && emailSent === 0 ? { scale: 0.98 } : {}}
              >
                {sendingTest ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : emailSent === 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Test Sent ✓</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Test Mail</span>
                  </>
                )}
              </motion.button>

              {isConfigReady && (
                <motion.span 
                  className="flex items-center gap-2 text-sm text-[#8EE147] ml-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>✨ Ready to send emails</span>
                </motion.span>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* ENHANCED FOOTER */}
        {/* ============================================ */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Secure connection</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Version 2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#8EE147] animate-pulse" />
                System Online
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#8EE147]" />
                v2.0.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}