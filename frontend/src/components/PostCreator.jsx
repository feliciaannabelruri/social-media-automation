import React, { useState } from 'react';
import { Upload, Send, X, Image, Video, FileText } from 'lucide-react';

const PostCreator = ({ accounts, onPost, loading }) => {
  const [postData, setPostData] = useState({
    caption: '',
    file: null,
    selectedAccounts: []
  });
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostData({ ...postData, file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({
          url: reader.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) // MB
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPostData({ ...postData, file: null });
    setPreview(null);
  };

  const toggleAccountSelection = (id) => {
    setPostData(prev => ({
      ...prev,
      selectedAccounts: prev.selectedAccounts.includes(id)
        ? prev.selectedAccounts.filter(a => a !== id)
        : [...prev.selectedAccounts, id]
    }));
  };

  const selectAllAccounts = () => {
    if (postData.selectedAccounts.length === accounts.length) {
      setPostData({ ...postData, selectedAccounts: [] });
    } else {
      setPostData({ ...postData, selectedAccounts: accounts.map(a => a._id) });
    }
  };

  const handleSubmit = () => {
    onPost(postData);
    // Reset form after posting
    setPostData({
      caption: '',
      file: null,
      selectedAccounts: []
    });
    setPreview(null);
  };

  const isFormValid = postData.caption && postData.file && postData.selectedAccounts.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Send size={24} className="text-blue-500" />
          Buat Postingan
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Posting ke multiple akun sekaligus
        </p>
      </div>

      <div className="space-y-5">
        {/* Caption Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText size={16} />
            Caption
          </label>
          <textarea
            value={postData.caption}
            onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
            placeholder="Tulis caption menarik di sini... 

Tips: Gunakan emoji 🎉 dan hashtags #trending"
            className="w-full p-4 border-2 border-gray-300 rounded-xl h-36 resize-none focus:border-blue-500 focus:outline-none transition font-sans"
            maxLength={2200}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Tip: Gunakan emoji dan hashtags untuk engagement lebih baik</span>
            <span className={`font-mono ${postData.caption.length > 2000 ? 'text-red-500' : ''}`}>
              {postData.caption.length} / 2200
            </span>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Media (Gambar/Video)
          </label>
          
          {!preview ? (
            <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer bg-gray-50">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
                id="file-upload-post"
              />
              <label htmlFor="file-upload-post" className="cursor-pointer block">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-base font-semibold text-gray-700 mb-1">
                  Klik untuk upload atau drag & drop
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF, MP4, MOV (Max 100MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="relative border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-900">
              <button
                onClick={removeFile}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10 shadow-lg transition transform hover:scale-110"
              >
                <X size={18} />
              </button>
              
              {preview.type === 'video' ? (
                <video 
                  src={preview.url} 
                  controls 
                  className="w-full max-h-96 object-contain"
                />
              ) : (
                <img 
                  src={preview.url} 
                  alt="Preview" 
                  className="w-full max-h-96 object-contain"
                />
              )}
              
              <div className="bg-gradient-to-t from-black to-transparent p-4 absolute bottom-0 left-0 right-0">
                <div className="flex items-center gap-2 text-white text-sm">
                  {preview.type === 'video' ? <Video size={16} /> : <Image size={16} />}
                  <span className="font-medium">{preview.name}</span>
                  <span className="text-gray-300">• {preview.size} MB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📱 Pilih Akun Target
            </label>
            {accounts.length > 0 && (
              <button
                onClick={selectAllAccounts}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {postData.selectedAccounts.length === accounts.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Belum ada akun tersedia</p>
                <p className="text-xs mt-1">Tambahkan akun terlebih dahulu</p>
              </div>
            ) : (
              accounts.map((account) => (
                <label
                  key={account._id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition border-2 ${
                    postData.selectedAccounts.includes(account._id)
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-transparent bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={postData.selectedAccounts.includes(account._id)}
                    onChange={() => toggleAccountSelection(account._id)}
                    className="w-5 h-5 cursor-pointer accent-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{account.name}</div>
                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                      {account.instagram?.enabled && (
                        <span className="flex items-center gap-1">
                          📷 @{account.instagram.username}
                        </span>
                      )}
                      {account.tiktok?.enabled && (
                        <span className="flex items-center gap-1">
                          🎵 @{account.tiktok.username}
                        </span>
                      )}
                    </div>
                  </div>
                  {postData.selectedAccounts.includes(account._id) && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  )}
                </label>
              ))
            )}
          </div>

          {postData.selectedAccounts.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              ✓ {postData.selectedAccounts.length} akun dipilih
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform shadow-lg ${
            isFormValid && !loading
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send size={22} />
          {loading ? (
            <>
              <span className="animate-pulse">Memposting...</span>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </>
          ) : (
            'Posting Sekarang 🚀'
          )}
        </button>

        {/* Info Alert */}
        {!isFormValid && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-700 text-sm">
                <p className="font-semibold mb-1">⚠️ Lengkapi semua field:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {!postData.caption && <li>Caption harus diisi</li>}
                  {!postData.file && <li>Upload gambar/video</li>}
                  {postData.selectedAccounts.length === 0 && <li>Pilih minimal 1 akun</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCreator;