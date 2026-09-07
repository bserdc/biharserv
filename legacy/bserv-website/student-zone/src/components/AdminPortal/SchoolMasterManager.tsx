import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Upload,
  Search,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { School } from '../../types';
import { api } from '../../services/api';

interface SchoolMasterManagerProps {
  schools: School[];
  onRefreshSchools: () => void;
}

export const SchoolMasterManager: React.FC<SchoolMasterManagerProps> = ({
  schools,
  onRefreshSchools,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // New School Fields
  const [newUdise, setNewUdise] = useState('');
  const [newName, setNewName] = useState('');
  const [newDistrict, setNewDistrict] = useState('Madhepura');
  const [newBlock, setNewBlock] = useState('Madhepura');
  const [newPanchayat, setNewPanchayat] = useState('');

  const districts = Array.from(new Set(schools.map((s) => s.district))).sort();

  const filteredSchools = schools.filter((s) => {
    if (selectedDistrict !== 'all' && s.district !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.school_name.toLowerCase().includes(q) ||
        s.udise_code.includes(q) ||
        s.block.toLowerCase().includes(q) ||
        s.panchayat.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUdise.trim() || !newName.trim()) return alert('UDISE and School Name required');

    try {
      const res = await api.addSchool({
        udise_code: newUdise.trim(),
        school_name: newName.trim(),
        district: newDistrict.trim(),
        block: newBlock.trim(),
        panchayat: newPanchayat.trim(),
      });

      if (res.success) {
        setIsAddOpen(false);
        setNewUdise('');
        setNewName('');
        onRefreshSchools();
      } else {
        alert(res.error || 'Failed to add school');
      }
    } catch (e) {
      alert('Error creating school record');
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        const mappedSchools: Partial<School>[] = rawData.map((row) => ({
          udise_code: String(row['udise_code'] || row['UDISE'] || row['U-DISE'] || '').trim(),
          school_name: String(row['school_name'] || row['School Name'] || row['School'] || '').trim(),
          district: String(row['district'] || row['District'] || 'Bihar').trim(),
          block: String(row['block'] || row['Block'] || 'Sadar').trim(),
          panchayat: String(row['panchayat'] || row['Panchayat'] || '').trim(),
        })).filter((s) => s.udise_code && s.school_name);

        if (mappedSchools.length === 0) {
          alert('No valid school rows found in file. Required columns: udise_code, school_name, district, block');
          return;
        }

        const res = await api.bulkAddSchools(mappedSchools);
        if (res.success) {
          alert(res.message);
          setIsBulkOpen(false);
          onRefreshSchools();
        }
      } catch (err) {
        alert('Failed to parse Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      { udise_code: '10020100201', school_name: 'Adarsh High School Murliganj', district: 'Madhepura', block: 'Murliganj', panchayat: 'Ward 03' },
      { udise_code: '10020100202', school_name: 'Govt Girls Inter College', district: 'Patna', block: 'Patna Sadar', panchayat: 'Ward 08' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Schools');
    XLSX.writeFile(wb, 'School_Master_Sample_Import.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
            School Directory Master (schools_master)
          </span>
          <h2 className="text-xl font-black text-slate-900">
            U-DISE Master School Directory
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Official school codes, blocks, districts maintain karein aur Excel (.xlsx) dwara bulk school database upload karein.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="open-bulk-school-modal-btn"
            onClick={() => setIsBulkOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Excel School Uploader</span>
          </button>

          <button
            id="open-add-school-modal-btn"
            onClick={() => setIsAddOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Naya School Jodein</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="School ka naam, U-DISE Code, Block ya Panchayat se khojein..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
          >
            <option value="all">Sabhi Jile ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-end font-mono text-slate-500 font-bold">
          Kul: {filteredSchools.length}
        </div>
      </div>

      {/* Schools Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((school) => (
          <div
            key={school._id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-mono text-[11px] font-bold rounded">
                  UDISE: {school.udise_code}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">{school.district}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{school.school_name}</h4>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Block: <strong>{school.block}</strong></span>
                {school.panchayat && <span>• Ward: {school.panchayat}</span>}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
              <span className="text-emerald-700 font-bold">Registration Form Me Active Hai</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD SINGLE SCHOOL MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Master Directory Me Naya School Jodein</h3>
            <p className="text-xs text-slate-500 mb-4">Naya school judte hi turant student registration forms me uplabdh ho jayega.</p>

            <form onSubmit={handleAddSchool} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official U-DISE Code (11 Ank)</label>
                <input
                  type="text"
                  value={newUdise}
                  onChange={(e) => setNewUdise(e.target.value)}
                  placeholder="e.g. 10020100109"
                  required
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School Ka Pura Naam</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Govt Girls Inter College"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jila (District)</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prakhand (Block)</label>
                  <input
                    type="text"
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Panchayat / Ward</label>
                <input
                  type="text"
                  value={newPanchayat}
                  onChange={(e) => setNewPanchayat(e.target.value)}
                  placeholder="e.g. Ward 04"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Radd Karein (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl"
                >
                  School Save Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EXCEL UPLOADER MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Bulk Master School Excel Uploader</h3>
            <p className="text-xs text-slate-500 mb-4">
              Statewide schools aur unke U-DISE code wali Excel (.xlsx) ya CSV file upload karein.
            </p>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center mb-4">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <label className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">
                <span>Excel File (.xlsx) Chunein</span>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">
                Supported columns: <code>udise_code, school_name, district, block, panchayat</code>
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={downloadSampleExcel}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Excel Template Download Karein</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Band Karein (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
