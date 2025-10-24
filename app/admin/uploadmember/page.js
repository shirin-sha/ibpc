'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function UploadMemberPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Check if user is admin
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Access Denied</h2>
          <p className="text-red-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls'].includes(fileExtension)) {
        setFile(selectedFile);
        setResults(null);
        toast.success('File selected successfully');
      } else {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-members', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        
        // Add to upload history
        const uploadRecord = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          fileName: file.name,
          totalRows: data.results.total,
          successCount: data.results.success.length,
          errorCount: data.results.errors.length,
          results: data.results
        };
        
        setUploadHistory(prev => [uploadRecord, ...prev]);
        
        toast.success(`Upload completed! ${data.results.success.length} members added successfully.`);
        if (data.results.errors.length > 0) {
          toast.error(`${data.results.errors.length} errors occurred. Check details below.`);
        }
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const templateData = [
      'memberId,name,designation,companyName,civilId,nationality,passportNumber,mobile,alternateMobile,email,alternateEmail,industrySector,alternateIndustrySector,companyBrief,companyAddress,linkedin,companyWebsite,membershipType,profession',
      'C-001A,Dr. Kazi E. Hossain,Managing Director & Partner,Al Shaheen Technical Contracting Co,,INDIAN,Z4826817,90070728,,kazi@alshaheentech.com,alshaheentech@yahoo.com,,,Electro Mechanical Civil Contracting,,,CORPORATE,Managing Director'
    ].join('\n');
    
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Upload Members from Excel
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {showHistory ? 'Hide History' : 'View History'}
          </button>
          <button
            onClick={downloadTemplate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* Upload History */}
      {showHistory && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Upload History
          </h2>
          {uploadHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No uploads yet</p>
          ) : (
            <div className="space-y-3">
              {uploadHistory.map((record) => (
                <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {record.fileName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {record.timestamp}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          ✅ {record.successCount} success
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          ❌ {record.errorCount} errors
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          📊 {record.totalRows} total
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Required Excel Columns:
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p><strong>Required:</strong> memberId, name, email, mobile, companyName, profession</p>
            <p><strong>Optional:</strong> designation, civilId, nationality, passportNumber, alternateMobile, alternateEmail, industrySector, alternateIndustrySector, companyBrief, companyAddress, linkedin, companyWebsite, membershipType</p>
          </div>
        </div>

     

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Members'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Upload Results
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                📊 Total Rows
              </h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {results.total}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                ✅ Successful
              </h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                {results.success.length}
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                ❌ Errors
              </h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-300">
                {results.errors.length}
              </p>
            </div>
          </div>

          {results.success.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Successfully Added Members:
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Serial No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.success.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.row}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.memberId}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.serialNumber}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.emailStatus === 'sent' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✅ Sent
                            </span>
                          ) : item.emailStatus === 'failed' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" title={item.emailError}>
                              ❌ Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              ⚠️ Not Sent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Errors:
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.errors.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.row}</td>
                        <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{item.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

