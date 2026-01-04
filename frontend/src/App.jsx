import React, { useState, useEffect } from 'react';
import AccountManager from './components/AccountManager';
import PostCreator from './components/PostCreator';
import ActivityLog from './components/ActivityLog';
import { accountAPI, postAPI } from './services/api';
import './App.css';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const addLog = (message, type = 'info') => {
    const newLog = {
      message,
      type,
      time: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
    setLogs(prev => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  // ============================================
  // Account Operations
  // ============================================
  const loadAccounts = async () => {
    try {
      addLog('Loading accounts...', 'info');
      const response = await accountAPI.getAll();
      setAccounts(response.data);
      addLog(`✓ Loaded ${response.data.length} accounts`, 'success');
    } catch (error) {
      addLog(`Failed to load accounts: ${error.message}`, 'error');
      console.error('Load accounts error:', error);
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      setLoading(true);
      addLog(`Adding account: ${accountData.name}...`, 'info');
      
      const response = await accountAPI.create(accountData);
      setAccounts([...accounts, response.data]);
      
      addLog(`✓ Account "${accountData.name}" added successfully`, 'success');
    } catch (error) {
      addLog(`✗ Failed to add account: ${error.response?.data?.error || error.message}`, 'error');
      console.error('Add account error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async (id, accountData) => {
    try {
      setLoading(true);
      addLog(`Updating account...`, 'info');
      
      const response = await accountAPI.update(id, accountData);
      setAccounts(accounts.map(acc => acc._id === id ? response.data : acc));
      
      addLog(`✓ Account updated successfully`, 'success');
    } catch (error) {
      addLog(`✗ Failed to update account: ${error.response?.data?.error || error.message}`, 'error');
      console.error('Update account error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Yakin ingin menghapus akun ini?')) {
      return;
    }

    try {
      addLog('Deleting account...', 'info');
      
      const account = accounts.find(a => a._id === id);
      await accountAPI.delete(id);
      setAccounts(accounts.filter(a => a._id !== id));
      
      addLog(`✓ Account "${account.name}" deleted`, 'success');
    } catch (error) {
      addLog(`✗ Failed to delete account: ${error.message}`, 'error');
      console.error('Delete account error:', error);
    }
  };

  // ============================================
  // Post Operations
  // ============================================
  const handlePost = async (postData) => {
    if (!postData.caption || !postData.file || postData.selectedAccounts.length === 0) {
      addLog('⚠ Please fill all required fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      addLog('========================================', 'info');
      addLog('🚀 Starting post creation...', 'info');
      addLog(`Caption: "${postData.caption.substring(0, 50)}${postData.caption.length > 50 ? '...' : ''}"`, 'info');
      addLog(`File: ${postData.file.name} (${(postData.file.size / 1024 / 1024).toFixed(2)} MB)`, 'info');
      addLog(`Targets: ${postData.selectedAccounts.length} account(s)`, 'info');
      addLog('========================================', 'info');

      const formData = new FormData();
      formData.append('media', postData.file);
      formData.append('caption', postData.caption);
      formData.append('accountIds', JSON.stringify(postData.selectedAccounts));

      const response = await postAPI.create(formData);

      if (response.data.success) {
        addLog('✓ Post request completed', 'success');
        
        response.data.results.forEach(result => {
          const status = result.success ? '✓' : '✗';
          const type = result.success ? 'success' : 'error';
          const account = accounts.find(a => a._id === result.accountId);
          
          addLog(
            `${status} ${result.platform} (@${result.username}): ${result.message}`,
            type
          );
        });

        const successCount = response.data.results.filter(r => r.success).length;
        const totalCount = response.data.results.length;
        
        addLog('========================================', 'info');
        addLog(`🎉 Posting completed: ${successCount}/${totalCount} successful`, successCount === totalCount ? 'success' : 'warning');
        addLog('========================================', 'info');
      }
    } catch (error) {
      addLog('========================================', 'error');
      addLog(`✗ Post failed: ${error.response?.data?.error || error.message}`, 'error');
      addLog('========================================', 'error');
      console.error('Post error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
            Social Media Automation
          </h1>
          <p className="text-gray-600 text-lg">
            📱 Post ke Instagram & TikTok dengan mudah dan cepat
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-700">Total Akun:</span>{' '}
              <span className="text-blue-600 font-bold">{accounts.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-700">Status:</span>{' '}
              <span className={`font-bold ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? '⏳ Processing...' : '✓ Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Account Manager */}
          <AccountManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateAccount={handleUpdateAccount}
            loading={loading}
          />

          {/* Post Creator */}
          <PostCreator
            accounts={accounts}
            onPost={handlePost}
            loading={loading}
          />
        </div>

        {/* Activity Log - Full Width */}
        <ActivityLog
          logs={logs}
          onClear={clearLogs}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Made with ❤️ for Social Media Automation • 
            <span className="font-semibold text-gray-700"> v1.0.0</span>
          </p>
          <p className="text-xs mt-1">
            ⚠️ Gunakan dengan bijak dan patuhi Terms of Service platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;