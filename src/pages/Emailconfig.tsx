import React, { useState } from "react";

export default function EmailConfiguration() {
  const [formData, setFormData] = useState({
    profileName: "",
    provider: "gmail",
    senderName: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    username: "",
    password: "",
    apiKey: "",
  });

  const [loading, setLoading] = useState(false);

  const smtpProviders = ["gmail", "outlook", "zoho", "custom_smtp"];
  const apiProviders = ["sendgrid", "ses", "mailgun"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/email-configurations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Email configuration saved successfully");

        setFormData({
          profileName: "",
          provider: "gmail",
          senderName: "",
          senderEmail: "",
          smtpHost: "",
          smtpPort: "",
          username: "",
          password: "",
          apiKey: "",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/email-configurations/test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      alert("Connection test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          Email Configuration
        </h2>

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
            <select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="zoho">Zoho</option>
              <option value="sendgrid">SendGrid</option>
              <option value="ses">Amazon SES</option>
              <option value="mailgun">Mailgun</option>
              <option value="custom_smtp">Custom SMTP</option>
            </select>
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

          {smtpProviders.includes(formData.provider) && (
            <>
              <div>
                <label className="block mb-1">SMTP Host</label>
                <input
                  type="text"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  placeholder="smtp.gmail.com"
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
            </>
          )}

          {apiProviders.includes(formData.provider) && (
            <div className="md:col-span-2">
              <label className="block mb-1">API Key</label>
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="Enter API Key"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Test Connection
          </button>

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