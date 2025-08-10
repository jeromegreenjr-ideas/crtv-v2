"use client";
import { useEffect, useState } from 'react';
import RequireRole from '../../../components/RequireRole';

export default function PersonnelPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch('/api/hr/personnel').then(r => r.json()).then(j => setRows(j.personnel || [])); }, []);
  return (
    <RequireRole allow={["hr","director","pm"]}>
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Personnel & Evaluation</h1>
          <a className="btn-secondary" href="/api/hr/personnel.csv">Export CSV</a>
        </div>
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['User','Tier','Quality','Timeliness','Collaboration'].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.userId} className="border-t">
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.tier}</td>
                  <td className="px-3 py-2">
                    <div className="w-40 bg-gray-200 h-2 rounded-full">
                      <div className="bg-status-success h-2 rounded-full" style={{ width: `${r.quality}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-40 bg-gray-200 h-2 rounded-full">
                      <div className="bg-status-progress h-2 rounded-full" style={{ width: `${r.timeliness}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-40 bg-gray-200 h-2 rounded-full">
                      <div className="bg-status-review h-2 rounded-full" style={{ width: `${r.collaboration}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-3 py-2 text-gray-600" colSpan={5}>No personnel data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}


