import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Edit2, Check, X } from 'lucide-react';

const AccountManager = ({ accounts, onAddAccount, onDeleteAccount, onUpdateAccount, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    instagram: { username: '', password: '', enabled: false },
    tiktok: { username: '', password: '', enabled: false }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      instagram: { username: '', password: '', enabled: false },
      tiktok: { username: '', password: '', enabled: false }
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      onUpdateAccount(editingId, formData);
    } else {
      onAddAccount(formData);
    }
    resetForm();
  };

  const handleEdit = (account) => {
    setFormData({
      name: account.name,
      instagram: account.instagram || { username: '', password: '', enabled: false },
      tiktok: account.tiktok || { username: '', password: '', enabled: false }
    });
    setEditingId(account._id);
    setShowForm(true);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Akun</h2>
          <p className="text-sm text-gray-500 mt-1">
            {accounts.length} akun terdaftar
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105 shadow-md"
        >
          <Plus size={20} />
          Tambah Akun
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">
              {editingId ? 'Edit Akun' : 'Tambah Akun Baru'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nama Akun */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Akun *
            </label>
            <input
              type="text"
              placeholder="Contoh: Akun A, Bisnis Utama, dll"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Instagram Section */}
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 transition">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="ig-enable"
                checked={formData.instagram.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  instagram: { ...formData.instagram, enabled: e.target.checked }
                })}
                className="w-5 h-5 cursor-pointer accent-pink-500"
              />
              <label htmlFor="ig-enable" className="font-bold text-pink-600 text-lg cursor-pointer flex items-center gap-2">
                📷 Instagram
              </label>
            </div>

            {formData.instagram.enabled && (
              <div className="space-y-3 mt-4 pl-8">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="instagram_username"
                    value={formData.instagram.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      instagram: { ...formData.instagram, username: e.target.value }
                    })}
                    className="w-full p-2 border rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.ig ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.instagram.password}
                      onChange={(e) => setFormData({
                        ...formData,
                        instagram: { ...formData.instagram, password: e.target.value }
                      })}
                      className="w-full p-2 border rounded-lg focus:border-pink-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('ig')}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.ig ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TikTok Section */}
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-400 transition">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="tt-enable"
                checked={formData.tiktok.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  tiktok: { ...formData.tiktok, enabled: e.target.checked }
                })}
                className="w-5 h-5 cursor-pointer accent-gray-800"
              />
              <label htmlFor="tt-enable" className="font-bold text-gray-800 text-lg cursor-pointer flex items-center gap-2">
                🎵 TikTok
              </label>
            </div>

            {formData.tiktok.enabled && (
              <div className="space-y-3 mt-4 pl-8">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="tiktok_username"
                    value={formData.tiktok.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      tiktok: { ...formData.tiktok, username: e.target.value }
                    })}
                    className="w-full p-2 border rounded-lg focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.tt ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.tiktok.password}
                      onChange={(e) => setFormData({
                        ...formData,
                        tiktok: { ...formData.tiktok, password: e.target.value }
                      })}
                      className="w-full p-2 border rounded-lg focus:border-gray-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('tt')}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.tt ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={20} />
              {loading ? 'Menyimpan...' : editingId ? 'Update Akun' : 'Simpan Akun'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-lg font-medium">Belum ada akun terdaftar</p>
            <p className="text-sm">Klik "Tambah Akun" untuk memulai</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account._id}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                    {account.name}
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {[account.instagram?.enabled && 'IG', account.tiktok?.enabled && 'TT'].filter(Boolean).join(' + ')}
                    </span>
                  </h3>

                  <div className="space-y-1">
                    {account.instagram?.enabled && (
                      <div className="flex items-center gap-2 text-sm text-pink-600">
                        <span className="font-medium">📷 Instagram:</span>
                        <span className="font-mono">@{account.instagram.username}</span>
                      </div>
                    )}
                    {account.tiktok?.enabled && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">🎵 TikTok:</span>
                        <span className="font-mono">@{account.tiktok.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition"
                    title="Edit akun"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(account._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition"
                    title="Hapus akun"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountManager;