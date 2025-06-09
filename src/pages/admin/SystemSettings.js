// src/pages/admin/SystemSettings.js - System settings and configuration
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Mail,
  Shield,
  FileText,
  Bell,
  Clock,
  Users,
  Server,
  HardDrive,
  Wifi,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SystemSettings = () => {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Settings state
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Sistem Surat Tugas',
      systemDescription: 'Sistem pengelolaan surat tugas digital',
      adminEmail: 'admin@example.com',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      language: 'id'
    },
    mail: {
      maxFileSize: 5, // MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      autoApproval: false,
      approvalTimeout: 7, // days
      reminderEnabled: true,
      reminderInterval: 24 // hours
    },
    security: {
      passwordMinLength: 6,
      passwordRequireNumbers: false,
      passwordRequireSymbols: false,
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      lockoutDuration: 30 // minutes
    },
    notifications: {
      emailNotifications: true,
      suratSubmitted: true,
      suratApproved: true,
      suratRejected: true,
      reminderNotifications: true
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupEnabled: true,
      backupInterval: 24 // hours
    }
  });

  // System status
  const [systemStatus, setSystemStatus] = useState({
    userService: 'connected',
    mailService: 'connected',
    database: 'connected',
    storage: 'connected',
    lastBackup: '2024-06-10 10:30:00',
    uptime: '5 days, 12 hours',
    diskUsage: 45, // percentage
    memoryUsage: 68 // percentage
  });

  // Tabs configuration
  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'mail', label: 'Surat', icon: FileText },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'system', label: 'System', icon: Server },
    { id: 'status', label: 'Status', icon: Activity }
  ];

  // Load settings (simulated)
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    loadSettings();
  }, []);

  // Handle settings change
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({
        text: 'Pengaturan berhasil disimpan',
        type: 'success'
      });
      
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (error) {
      setMessage({
        text: 'Gagal menyimpan pengaturan',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua pengaturan ke default?')) {
      // Reset to default values
      setMessage({
        text: 'Pengaturan berhasil direset ke default',
        type: 'success'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  // Export settings
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage({
      text: 'Pengaturan berhasil diekspor',
      type: 'success'
    });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Import settings
  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setMessage({
            text: 'Pengaturan berhasil diimpor',
            type: 'success'
          });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
          setMessage({
            text: 'Format file tidak valid',
            type: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h1>
            <p className="text-gray-600">
              Kelola konfigurasi dan pengaturan sistem surat tugas
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
              id="import-settings"
            />
            <label
              htmlFor="import-settings"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </label>
            <button
              onClick={handleExportSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pengaturan Umum</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sistem
                  </label>
                  <input
                    type="text"
                    value={settings.general.systemName}
                    onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Admin
                  </label>
                  <input
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta</option>
                    <option value="Asia/Makassar">Asia/Makassar</option>
                    <option value="Asia/Jayapura">Asia/Jayapura</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format Tanggal
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Sistem
                </label>
                <textarea
                  value={settings.general.systemDescription}
                  onChange={(e) => handleSettingChange('general', 'systemDescription', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Mail Settings */}
          {activeTab === 'mail' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pengaturan Surat</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ukuran File Maksimal (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.mail.maxFileSize}
                    onChange={(e) => handleSettingChange('mail', 'maxFileSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout Persetujuan (hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.mail.approvalTimeout}
                    onChange={(e) => handleSettingChange('mail', 'approvalTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format File yang Diizinkan
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['pdf', 'doc', 'docx', 'jpg', 'png', 'jpeg'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.mail.allowedFileTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...settings.mail.allowedFileTypes, type]
                            : settings.mail.allowedFileTypes.filter(t => t !== type);
                          handleSettingChange('mail', 'allowedFileTypes', newTypes);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.mail.autoApproval}
                    onChange={(e) => handleSettingChange('mail', 'autoApproval', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Persetujuan Otomatis</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.mail.reminderEnabled}
                    onChange={(e) => handleSettingChange('mail', 'reminderEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pengingat Otomatis</span>
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pengaturan Keamanan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Panjang Password Minimal
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout Sesi (jam)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Percobaan Login
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Lockout (menit)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordRequireNumbers}
                    onChange={(e) => handleSettingChange('security', 'passwordRequireNumbers', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Password harus mengandung angka</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordRequireSymbols}
                    onChange={(e) => handleSettingChange('security', 'passwordRequireSymbols', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Password harus mengandung simbol</span>
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pengaturan Notifikasi</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Aktifkan notifikasi email</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications.suratSubmitted}
                    onChange={(e) => handleSettingChange('notifications', 'suratSubmitted', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Notifikasi surat diajukan</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications.suratApproved}
                    onChange={(e) => handleSettingChange('notifications', 'suratApproved', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Notifikasi surat disetujui</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications.suratRejected}
                    onChange={(e) => handleSettingChange('notifications', 'suratRejected', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Notifikasi surat ditolak</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications.reminderNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'reminderNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pengingat otomatis</span>
                </label>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pengaturan Sistem</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mode Maintenance</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.system.debugMode}
                    onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mode Debug</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.system.backupEnabled}
                    onChange={(e) => handleSettingChange('system', 'backupEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Backup Otomatis</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level Log
                  </label>
                  <select
                    value={settings.system.logLevel}
                    onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interval Backup (jam)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.system.backupInterval}
                    onChange={(e) => handleSettingChange('system', 'backupInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!settings.system.backupEnabled}
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Status Sistem</h3>
              
              {/* Service Status */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Status Layanan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'User Service', status: systemStatus.userService, icon: Users },
                    { name: 'Mail Service', status: systemStatus.mailService, icon: Mail },
                    { name: 'Database', status: systemStatus.database, icon: Database },
                    { name: 'Storage', status: systemStatus.storage, icon: HardDrive }
                  ].map((service) => {
                    const Icon = service.icon;
                    return (
                      <div key={service.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs ${
                            service.status === 'connected' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {service.status === 'connected' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* System Info */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Informasi Sistem</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{systemStatus.uptime}</p>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{systemStatus.lastBackup}</p>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Disk Usage</span>
                      <HardDrive className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            systemStatus.diskUsage > 80 ? 'bg-red-500' : 
                            systemStatus.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemStatus.diskUsage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{systemStatus.diskUsage}%</span>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <Server className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            systemStatus.memoryUsage > 80 ? 'bg-red-500' : 
                            systemStatus.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemStatus.memoryUsage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{systemStatus.memoryUsage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {activeTab !== 'status' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleResetSettings}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset ke Default</span>
            </button>
            
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;