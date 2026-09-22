'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Store, Save, Send, CheckCircle2, XCircle, ShieldCheck, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getShopSettings, updateShopSettings, sendTestDailyReport } from '@/lib/actions/settingsActions';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    ownerPhone: '',
    ownerWhatsAppNumber: '',
    dailyReportEnabled: true,
    dailyReportTime: '21:00',
    address: '',
    gstNumber: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [testResult, setTestResult] = useState<{ mode?: string; message?: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getShopSettings();
        setFormData({
          shopName: data.shopName,
          ownerName: data.ownerName,
          ownerPhone: data.ownerPhone,
          ownerWhatsAppNumber: data.ownerWhatsAppNumber,
          dailyReportEnabled: data.dailyReportEnabled,
          dailyReportTime: data.dailyReportTime,
          address: data.address,
          gstNumber: data.gstNumber || '',
        });
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await updateShopSettings({
        ...formData,
      });

      setSaving(false);

      if (res.success) {
        setSuccessMsg('Shop settings and WhatsApp report configuration saved successfully.');
      } else {
        setError(res.error || 'Failed to save settings.');
      }
    } catch {
      setSaving(false);
      setError('An unexpected error occurred while saving settings.');
    }
  };

  const handleSendTestReport = async () => {
    setError('');
    setSuccessMsg('');
    setTestResult(null);
    setTesting(true);

    try {
      const res = await sendTestDailyReport();
      setTesting(false);

      if (res.success) {
        setTestResult({
          mode: res.mode,
          message: res.message,
        });
      } else {
        setError(res.error || 'Failed to send test daily report.');
      }
    } catch {
      setTesting(false);
      setError('An unexpected error occurred while generating test report.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading ShopMaster settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" /> Shop & System Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Configure shop profile, GSTIN, owner details, and daily 9 PM WhatsApp profit reports
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving} icon={<Save className="w-4 h-4" />}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Shop Profile */}
        <Card title="Shop Profile" subtitle="Printed on customer tax invoices & receipts">
          <div className="space-y-4">
            <Input
              label="Shop Name *"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="e.g. ShopMaster General & Electronics Store"
              required
            />

            <Input
              label="Shop Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full shop address"
              required
            />

            <Input
              label="GSTIN Number (Optional)"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="e.g. 29ABCDE1234F1Z5"
              helperText="Leave blank if operating as Non-GST store only"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                label="Owner Name *"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Ramesh Kumar"
                required
              />

              <Input
                label="Primary Phone Number *"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />
            </div>
          </div>
        </Card>

        {/* Right Column: Daily WhatsApp Report Configuration */}
        <Card
          title="Daily WhatsApp Profit Report"
          subtitle="Automated nightly financial summary sent to shop owner"
        >
          <div className="space-y-4">
            {/* Informational Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Nightly Report
              </p>
              <p className="text-slate-300 leading-relaxed">
                ShopMaster can send your daily sales, COGS, gross profit, expenses, and net profit summary directly to your WhatsApp every night at <strong>09:00 PM IST</strong>.
              </p>
            </div>

            {/* Status Indicators */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Report Status:</span>
              <Badge variant={formData.dailyReportEnabled ? 'success' : 'neutral'} size="md">
                {formData.dailyReportEnabled ? '✓ Daily report enabled' : '○ Daily report disabled'}
              </Badge>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Enable Daily WhatsApp Report
                </label>
                <span className="text-[11px] text-slate-500">
                  Send financial P&L summary at 9:00 PM IST
                </span>
              </div>
              <input
                type="checkbox"
                name="dailyReportEnabled"
                checked={formData.dailyReportEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            <Input
              label="Owner WhatsApp Number *"
              name="ownerWhatsAppNumber"
              value={formData.ownerWhatsAppNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number e.g. 9876543210"
              helperText="Report will be dispatched to this WhatsApp phone"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Scheduled Time (IST)
                </label>
                <input
                  type="text"
                  value="09:00 PM IST (21:00)"
                  disabled
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Timezone
                </label>
                <input
                  type="text"
                  value="Asia/Kolkata (IST)"
                  disabled
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Test Report Trigger Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Manual Test Dispatch</h4>
                  <p className="text-[11px] text-slate-500">
                    Send immediate test P&L report to owner WhatsApp without waiting until 9 PM
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSendTestReport}
                  disabled={testing}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  {testing ? 'Sending Test...' : 'Send Test Report'}
                </Button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-semibold ${
                    testResult.mode === 'SENT'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-sky-50 border-sky-200 text-sky-800'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Mode: [{testResult.mode}]
                  </p>
                  <p className="text-[11px] font-normal leading-relaxed">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
