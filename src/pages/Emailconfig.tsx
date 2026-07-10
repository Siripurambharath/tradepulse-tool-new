// import React, { useState, useEffect } from "react";
// import {API_URL, ACTIVITY_URL} from "@/components/api";

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
// const [emailSent, setEmailSent] = useState(0);
// const [sendingTest, setSendingTest] = useState(false);

//   useEffect(() => {
//     fetchConfig();
//     // Log page view (action_id: 38, module_id: 12)
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

//       const response = await fetch(
//         `${API_URL}/api/email-configurations/${seller.id}`
//       );

//       const data = await response.json();

//    if (data.success) {

//   setEmailConfig(data.data.email_config);
//   setEmailSent(data.data.email_sent);
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

//       // Log save attempt (action_id: 39, module_id: 12)
//       await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
//         profile_name: formData.profileName,
//         provider: formData.provider,
//         sender_email: formData.senderEmail
//       });

//       const response = await fetch(
//         `${API_URL}/api/email-configurations/${seller.id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       const data = await response.json();
// if (data.success) {

//     setEmailConfig(1);

//     alert("Configuration updated successfully");
// } else {
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

//   try {

//     setSendingTest(true);

//     const seller = JSON.parse(localStorage.getItem("seller"));

//     const response = await fetch(
//       `${API_URL}/api/send-test-email/${seller.id}`,
//       {
//         method: "POST"
//       }
//     );

//     const data = await response.json();

//     if (data.success) {

//       setEmailSent(1);

//       alert("Test Email Sent Successfully.");

//     } else {

//       alert(data.message);

//     }

//   } catch (err) {

//     console.log(err);

//     alert("Unable to send email.");

//   } finally {

//     setSendingTest(false);

//   }

// };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white shadow rounded-lg p-6">
//         <h2 className="text-2xl font-bold mb-6">Email Configuration</h2>

//         <div className="grid md:grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-1">Profile Name</label>
//             <input
//               type="text"
//               name="profileName"
//               value={formData.profileName}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="Sales Gmail"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Provider</label>
//             <input
//               type="text"
//               name="provider"
//               value={formData.provider}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="gmail, custom_smtp, etc."
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Sender Name</label>
//             <input
//               type="text"
//               name="senderName"
//               value={formData.senderName}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="Sales Team"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Sender Email</label>
//             <input
//               type="email"
//               name="senderEmail"
//               value={formData.senderEmail}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="sales@company.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">SMTP Host</label>
//             <input
//               type="text"
//               name="smtpHost"
//               value={formData.smtpHost}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="smtp.example.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">SMTP Port</label>
//             <input
//               type="number"
//               name="smtpPort"
//               value={formData.smtpPort}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="587"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">IMAP Host (for receiving replies)</label>
//             <input
//               type="text"
//               name="imapHost"
//               value={formData.imapHost}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="imap.example.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">IMAP Port</label>
//             <input
//               type="number"
//               name="imapPort"
//               value={formData.imapPort}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="993"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="sales@gmail.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Password / App Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block mb-1">API Key (only if using an API-based provider)</label>
//             <input
//               type="password"
//               name="apiKey"
//               value={formData.apiKey}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               placeholder="Enter API Key"
//             />
//           </div>
//         </div>

//        <div className="flex gap-3 mt-6">

// <button
//     onClick={handleSave}
//     disabled={loading}
//     className="px-4 py-2 bg-blue-600 text-white rounded"
// >
//     {loading ? "Saving..." : "Save Configuration"}
// </button>

// <button
//     onClick={sendTestMail}
//     disabled={
//       emailConfig !== 1 ||
//       emailSent === 1 ||
//       sendingTest
//     }
//     className={`px-4 py-2 rounded text-white ${
//       emailConfig !== 1 || emailSent === 1
//         ? "bg-gray-400 cursor-not-allowed"
//         : "bg-green-600"
//     }`}
// >
//     {sendingTest
//       ? "Sending..."
//       : emailSent === 1
//       ? "Test Mail Sent"
//       : "Send Test Mail"}
// </button>

// </div>
// {emailConfig === 0 && (

// <p className="text-red-600 mt-3">
// Please save configuration first.
// </p>

// )}

// {emailConfig === 1 && emailSent === 1 && (

// <p className="text-green-600 mt-3">
// Test email already sent successfully.
// </p>

// )}
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
  ChevronRight, ArrowRight, Check, X
} from 'lucide-react';

// Activity Log Helper Functions
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

export default function EmailConfiguration() {
  const [formData, setFormData] = useState({
    profileName: "",
    provider: "",
    senderName: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    imapHost: "",
    imapPort: "",
    username: "",
    password: "",
    apiKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState(0);
  const [emailSent, setEmailSent] = useState(0);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchConfig();
    createActivityLog(39, 12, 'Viewed email configuration page');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchConfig = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("seller"));
      const response = await fetch(`${API_URL}/api/email-configurations/${seller.id}`);
      const data = await response.json();

      if (data.success) {
        setEmailConfig(data.data.email_config);
        setEmailSent(data.data.email_sent);
        setFormData({
          profileName: data.data.profile_name || "",
          provider: data.data.provider || "",
          senderName: data.data.sender_name || "",
          senderEmail: data.data.sender_email || "",
          smtpHost: data.data.smtp_host || "",
          smtpPort: data.data.smtp_port || "",
          imapHost: data.data.imap_host || "",
          imapPort: data.data.imap_port || "",
          username: data.data.username || "",
          password: data.data.password || "",
          apiKey: data.data.api_key || "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const seller = JSON.parse(localStorage.getItem("seller"));

      await createActivityLog(38, 12, `Saved email configuration for: ${seller.email || seller.id}`, {
        profile_name: formData.profileName,
        provider: formData.provider,
        sender_email: formData.senderEmail
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
        alert("Configuration updated successfully");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const sendTestMail = async () => {
    try {
      setSendingTest(true);
      const seller = JSON.parse(localStorage.getItem("seller"));
      const response = await fetch(`${API_URL}/api/send-test-email/${seller.id}`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        setEmailSent(1);
        alert("Test Email Sent Successfully.");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Unable to send email.");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 p-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Email Configuration
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                Configure your email settings for sending and receiving
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-2xl border p-4 transition-all duration-300 ${
            emailConfig === 1 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration</p>
                <p className="text-lg font-bold mt-1 flex items-center gap-2">
                  {emailConfig === 1 ? (
                    <>
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-700">Configured</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Not Configured</span>
                    </>
                  )}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${
                emailConfig === 1 
                  ? 'bg-emerald-100' 
                  : 'bg-gray-100'
              }`}>
                <Shield className={`h-5 w-5 ${
                  emailConfig === 1 
                    ? 'text-emerald-600' 
                    : 'text-gray-400'
                }`} />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 transition-all duration-300 ${
            emailSent === 1 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Test Email</p>
                <p className="text-lg font-bold mt-1 flex items-center gap-2">
                  {emailSent === 1 ? (
                    <>
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-700">Sent</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-700">Pending</span>
                    </>
                  )}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${
                emailSent === 1 
                  ? 'bg-emerald-100' 
                  : 'bg-amber-50'
              }`}>
                <Send className={`h-5 w-5 ${
                  emailSent === 1 
                    ? 'text-emerald-600' 
                    : 'text-amber-500'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="text-lg font-bold mt-1 flex items-center gap-2">
                  {emailConfig === 1 && emailSent === 1 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-700">Ready</span>
                    </>
                  ) : emailConfig === 1 ? (
                    <>
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-700">Test Pending</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">Setup Required</span>
                    </>
                  )}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Configuration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Configuration Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email server details to start sending and receiving emails
            </p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Profile Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Profile Name
                </label>
                <input
                  type="text"
                  name="profileName"
                  value={formData.profileName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="Sales Gmail"
                />
              </div>

              {/* Provider */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  Provider
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="gmail, custom_smtp, etc."
                />
              </div>

              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  Sender Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="Sales Team"
                />
              </div>

              {/* Sender Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-blue-500" />
                  Sender Email
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="sales@company.com"
                />
              </div>

              {/* SMTP Host */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  SMTP Host
                </label>
                <input
                  type="text"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="smtp.example.com"
                />
              </div>

              {/* SMTP Port */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  SMTP Port
                </label>
                <input
                  type="number"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="587"
                />
              </div>

              {/* IMAP Host */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  IMAP Host
                </label>
                <input
                  type="text"
                  name="imapHost"
                  value={formData.imapHost}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="imap.example.com"
                />
              </div>

              {/* IMAP Port */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  IMAP Port
                </label>
                <input
                  type="number"
                  name="imapPort"
                  value={formData.imapPort}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="993"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="sales@gmail.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Password / App Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="Enter password"
                />
              </div>

              {/* API Key */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  API Key
                  <span className="text-xs text-muted-foreground font-normal">
                    (only if using an API-based provider)
                  </span>
                </label>
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 outline-none"
                  placeholder="Enter API Key"
                />
              </div>
            </div>

            {/* Status Messages */}
            <div className="mt-6 space-y-2">
              {emailConfig === 0 && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">Please save configuration first before sending test email.</p>
                </div>
              )}

              {emailConfig === 1 && emailSent === 1 && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm text-emerald-700">Test email already sent successfully. Your configuration is working!</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </button>

              <button
                onClick={sendTestMail}
                disabled={emailConfig !== 1 || emailSent === 1 || sendingTest}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  emailConfig !== 1 || emailSent === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {sendingTest ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : emailSent === 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Test Mail Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Test Mail
                  </>
                )}
              </button>

              {emailConfig === 1 && emailSent === 1 && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                  All set! Ready to send emails.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}