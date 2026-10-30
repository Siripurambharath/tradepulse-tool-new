
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Send,
  Database,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const providers = [
  {
    name: "Gmail",
    key: "gmail",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    imapHost: "imap.gmail.com",
    imapPort: "993",
  },
  {
    name: "Outlook / Microsoft 365",
    key: "outlook",
    smtpHost: "smtp.office365.com",
    smtpPort: "587",
    imapHost: "outlook.office365.com",
    imapPort: "993",
  },
  {
    name: "Yahoo Mail",
    key: "yahoo",
    smtpHost: "smtp.mail.yahoo.com",
    smtpPort: "587",
    imapHost: "imap.mail.yahoo.com",
    imapPort: "993",
  },
];

export default function EmailPortDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedProvider = String(
    location.state?.provider || ""
  ).toLowerCase();

  const selectedKey = selectedProvider.includes("gmail")
    ? "gmail"
    : selectedProvider.includes("outlook") ||
      selectedProvider.includes("office365") ||
      selectedProvider.includes("microsoft")
    ? "outlook"
    : selectedProvider.includes("yahoo")
    ? "yahoo"
    : "";

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: "#0E223B" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-[#8EE147]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#8EE147]">
              Email Port Details
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              SMTP and IMAP server settings for popular email providers
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="mb-6 p-4 rounded-xl border border-[#8EE147]/20 bg-[#8EE147]/10">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#8EE147] mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-[#8EE147]">
                Email Server Configuration Guide
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Select your email provider and use the corresponding
                SMTP and IMAP server details in your configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {providers.map((provider) => {
            const isSelected = selectedKey === provider.key;

            return (
              <div
                key={provider.key}
                className={`rounded-2xl border overflow-hidden ${
                  isSelected
                    ? "border-[#8EE147] shadow-lg shadow-[#8EE147]/10"
                    : "border-white/10"
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, #122B47, #0E223B)",
                }}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#8EE147]/10">
                      <Mail className="h-5 w-5 text-[#8EE147]" />
                    </div>

                    <div>
                      <h2 className="font-bold text-white">
                        {provider.name}
                      </h2>
                      <p className="text-xs text-slate-400">
                        Email server configuration
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-semibold text-[#8EE147] bg-[#8EE147]/10 px-3 py-1.5 rounded-lg">
                      Selected
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4">

                  {/* SMTP Details */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Send className="h-4 w-4 text-[#8EE147]" />
                      <h3 className="font-semibold text-white">
                        SMTP - Sending Emails
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 mb-1">
                          Provider
                        </p>
                        <p className="text-sm text-white">
                          {provider.name}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 mb-1">
                          SMTP Host
                        </p>
                        <p className="text-sm text-white break-all">
                          {provider.smtpHost}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          SMTP Port
                        </p>
                        <p className="text-2xl font-bold text-[#8EE147]">
                          {provider.smtpPort}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* IMAP Details */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="h-4 w-4 text-[#8EE147]" />
                      <h3 className="font-semibold text-white">
                        IMAP - Receiving Emails
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 mb-1">
                          Provider
                        </p>
                        <p className="text-sm text-white">
                          {provider.name}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 mb-1">
                          IMAP Host
                        </p>
                        <p className="text-sm text-white break-all">
                          {provider.imapHost}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          IMAP Port
                        </p>
                        <p className="text-2xl font-bold text-[#8EE147]">
                          {provider.imapPort}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Server Details Table */}
        {/* <div className="mt-6 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">
              Server Details
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Field</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-white">
                {providers.map((provider) => (
                  <React.Fragment key={provider.key}>
                    <tr>
                      <td
                        className="px-4 py-3 font-semibold text-[#8EE147]"
                        rowSpan={4}
                      >
                        {provider.name}
                      </td>
                      <td className="px-4 py-3">SMTP Host</td>
                      <td className="px-4 py-3 break-all">
                        {provider.smtpHost}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3">SMTP Port</td>
                      <td className="px-4 py-3">{provider.smtpPort}</td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3">IMAP Host</td>
                      <td className="px-4 py-3 break-all">
                        {provider.imapHost}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3">IMAP Port</td>
                      <td className="px-4 py-3">{provider.imapPort}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Google App Password Guide */}
        <div className="mt-6 rounded-xl border border-[#8EE147]/20 bg-[#122B47] overflow-hidden">

          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8EE147]/10">
              <ShieldCheck className="h-5 w-5 text-[#8EE147]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#8EE147]">
                Google App Password Guide
              </h2>
              <p className="text-xs text-slate-400">
                Follow these steps to generate your Gmail App Password
              </p>
            </div>
          </div>

          <div className="p-4">
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[#8EE147]/10 text-[#8EE147] flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <p className="text-sm text-slate-300 pt-1">
                  Open your Google Account:{" "}
                  <a
                    href="https://myaccount.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8EE147] underline"
                  >
                    Google Account
                  </a>
                </p>
              </li>

              {[
                "Go to Security.",
                "Enable 2-Step Verification if it is not already enabled.",
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[#8EE147]/10 text-[#8EE147] flex items-center justify-center text-sm font-bold">
                    {index + 2}
                  </span>
                  <p className="text-sm text-slate-300 pt-1">{step}</p>
                </li>
              ))}

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[#8EE147]/10 text-[#8EE147] flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <p className="text-sm text-slate-300 pt-1">
                  Open{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8EE147] underline"
                  >
                    App Passwords
                  </a>.
                </p>
              </li>

              {[
                <>
                  Enter an app name, for example{" "}
                  <code className="text-[#8EE147]">GlobPulse Email</code>.
                </>,
                <>
                  Click <strong className="text-white">Create</strong>.
                </>,
                <>
                  Google generates a{" "}
                  <strong className="text-white">16-character App Password</strong>.
                </>,
                <>Copy the generated App Password.</>,
                <>
                  Enter it in your application's{" "}
                  <strong className="text-white">Password</strong> field.
                </>,
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[#8EE147]/10 text-[#8EE147] flex items-center justify-center text-sm font-bold">
                    {index + 5}
                  </span>
                  <p className="text-sm text-slate-300 pt-1">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-5">
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#8EE147] px-4 py-2.5 text-sm font-semibold text-[#0E223B] hover:opacity-90"
              >
                Generate Google App Password
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Note: Google App Passwords require 2-Step Verification.
              Availability depends on your Google Account type and security settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8EE147] to-[#6EC035] text-[#0E223B] font-semibold hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
