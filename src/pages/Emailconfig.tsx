import React, { useState, useEffect } from "react";
import API_URL from "@/components/api";

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

  useEffect(() => {
    fetchConfig();
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

      const response = await fetch(
        `${API_URL}/api/email-configurations/${seller.id}`
      );

      const data = await response.json();

      if (data.success) {
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

      const response = await fetch(
        `${API_URL}/api/email-configurations/${seller.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Email Configuration</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Profile Name</label>
            <input
              type="text"
              name="profileName"
              value={formData.profileName}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Sales Gmail"
            />
          </div>

          <div>
            <label className="block mb-1">Provider</label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="gmail, custom_smtp, etc."
            />
          </div>

          <div>
            <label className="block mb-1">Sender Name</label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Sales Team"
            />
          </div>

          <div>
            <label className="block mb-1">Sender Email</label>
            <input
              type="email"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="sales@company.com"
            />
          </div>

          <div>
            <label className="block mb-1">SMTP Host</label>
            <input
              type="text"
              name="smtpHost"
              value={formData.smtpHost}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="smtp.example.com"
            />
          </div>

          <div>
            <label className="block mb-1">SMTP Port</label>
            <input
              type="number"
              name="smtpPort"
              value={formData.smtpPort}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="587"
            />
          </div>

          <div>
            <label className="block mb-1">IMAP Host (for receiving replies)</label>
            <input
              type="text"
              name="imapHost"
              value={formData.imapHost}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="imap.example.com"
            />
          </div>

          <div>
            <label className="block mb-1">IMAP Port</label>
            <input
              type="number"
              name="imapPort"
              value={formData.imapPort}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="993"
            />
          </div>

          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="sales@gmail.com"
            />
          </div>

          <div>
            <label className="block mb-1">Password / App Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1">API Key (only if using an API-based provider)</label>
            <input
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Enter API Key"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}