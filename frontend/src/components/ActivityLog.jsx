// FILE: frontend/src/components/ActivityLog.jsx
import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

const ActivityLog = ({ logs, onClear }) => {
  const logEndRef = useRef(null);

  // Auto scroll to bottom when new log added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'error':
        return <XCircle size={14} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={14} className="text-yellow-400" />;
      default:
        return <Info size={14} className="text-blue-400" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const exportLogs = () => {
    const logText = logs
      .map(log => `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <Terminal size={20} className="text-blue-500" />
          Activity Log
          {logs.length > 0 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {logs.length}
            </span>
          )}
        </h3>
        
        <div className="flex gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={exportLogs}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                title="Export logs"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={onClear}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                title="Clear logs"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Log Container */}
      <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs shadow-inner">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Terminal size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No activity yet...</p>
            <p className="text-xs mt-1">Logs will appear here</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${getLogColor(log.type)} hover:bg-gray-800 p-1.5 rounded transition`}
              >
                <span className="text-gray-500 text-[10px] font-bold mt-0.5">
                  {log.time}
                </span>
                <div className="mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <span className="flex-1 leading-relaxed">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {logs.length > 0 && (
        <div className="mt-3 flex gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle size={14} />
            <span className="font-medium">
              {logs.filter(l => l.type === 'success').length} Success
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-red-600">
            <XCircle size={14} />
            <span className="font-medium">
              {logs.filter(l => l.type === 'error').length} Errors
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <Info size={14} />
            <span className="font-medium">
              {logs.filter(l => l.type === 'info').length} Info
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;