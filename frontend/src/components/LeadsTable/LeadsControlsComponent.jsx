import React, { useRef } from 'react';
import { Upload, Download, Plus } from 'lucide-react';
import { importLeads } from '../../api/LeadsApi'; // Ensure the correct path to LeadsApi
import axios from 'axios';
import Papa from 'papaparse'; // Ensure you have this library installed
const LeadsControlsComponent = ({
  handleExport,
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
  setShowAddModal,
}) => {
  const fileInputRef = useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return alert('Please select a file.');

    try {
      const response = await importLeads(file); // ✅ Now just pass the file
      alert(response.message || 'Leads imported successfully!');
    } catch (err) {
      alert(err.message || 'Import failed');
    }
  };
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-4">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".csv"
        />
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="mr-2" size={16} /> Import
        </button>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
          onClick={handleExport}
        >
          <Download className="mr-2" size={16} /> Export
        </button>
      </div>
      <div className="flex space-x-4 items-center">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 w-20 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2" size={16} /> Add New
        </button>
      </div>
    </div>
  );
};

export default LeadsControlsComponent;