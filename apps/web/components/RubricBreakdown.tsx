"use client";
import React from 'react';

type Criterion = {
  key: string;
  label: string;
  score: number;
  weight?: number;
  reason?: string;
};

export function RubricBreakdown({ criteria, preview = false, limit = 6 }: { criteria?: Criterion[]; preview?: boolean; limit?: number }) {
  if (!criteria || criteria.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        {preview ? 'Sign in to view the full rubric breakdown.' : 'No rubric available.'}
      </div>
    );
  }

  const list = preview ? criteria.slice(0, Math.min(criteria.length, limit)) : criteria;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((c) => {
        const statusClass = c.score >= 8
          ? 'bg-status-success/10 text-status-success'
          : c.score >= 5
            ? 'bg-status-warning/10 text-status-warning'
            : 'bg-status-danger/10 text-status-danger';
        return (
          <div key={c.key} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.label}</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>Score {c.score}</span>
            </div>
            {typeof c.weight === 'number' && (
              <div className="text-xs text-gray-500 mt-0.5">Weight {Math.round((c.weight || 0) * 100)}%</div>
            )}
            {c.reason && (
              <div className="text-sm text-gray-600 mt-2 line-clamp-3">{c.reason}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}


