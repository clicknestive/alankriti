"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ScrollText, Calendar, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  adminEmail: string;
  createdAt: string;
}

function actionBadgeClass(action: string): string {
  if (action.includes("DELETE") || action.includes("BLOCKED")) return "bg-red-100 text-red-700 border-red-200";
  if (action.includes("CREATE") || action.includes("APPROVED") || action.includes("UNBLOCKED")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (action.includes("UPDATE") || action.includes("STOCK") || action.includes("STATUS") || action.includes("PATCH")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (action.includes("FLAG") || action.includes("HIDDEN")) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const LIMIT = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (entityTypeFilter) params.set("entityType", entityTypeFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      if (data.actionTypes?.length) setActionTypes(data.actionTypes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  const ENTITY_TYPES = ["Product", "Category", "Order", "User", "Review", "Session"];

  return (
    <div className="space-y-5">
      {/* Search & filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B89A]" size={16} />
            <input
              type="text"
              placeholder="Search actions, details, admin email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition-colors ${showFilters ? "border-[#C6A15B] text-[#826530] bg-[#F8F1E7]" : "border-[#D4C5B0] text-[#5E7052] bg-white hover:border-[#C6A15B]"}`}
          >
            <Filter size={15} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-[#E8E0D5]">
            <div>
              <label className="text-[#5E7052] text-xs font-medium block mb-1">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
              >
                <option value="">All Actions</option>
                {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#5E7052] text-xs font-medium block mb-1">Entity Type</label>
              <select
                value={entityTypeFilter}
                onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
              >
                <option value="">All Types</option>
                {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#5E7052] text-xs font-medium block mb-1 flex items-center gap-1"><Calendar size={11} /> From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
              />
            </div>
            <div>
              <label className="text-[#5E7052] text-xs font-medium block mb-1 flex items-center gap-1"><Calendar size={11} /> To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-[#5E7052]">{total} log{total !== 1 ? "s" : ""} found</div>

      {/* Logs list */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-[#5E7052]">
            <ScrollText className="mx-auto mb-3 text-[#D4C5B0]" size={36} />
            <p>No audit logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E8DC]">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAF6F0]">
                {/* Action badge */}
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${actionBadgeClass(log.action)} whitespace-nowrap`}>
                  {log.action}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#43513B] text-sm leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#5E7052]">
                    <span>{log.entityType} · <span className="font-mono">{log.entityId.slice(0, 12)}{log.entityId.length > 12 ? "…" : ""}</span></span>
                    <span>·</span>
                    <span>{log.adminEmail}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="shrink-0 text-right text-xs text-[#5E7052]">
                  <div>{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0E8DC]">
            <span className="text-xs text-[#5E7052]">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronLeft size={15} /></button>
              <span className="text-xs text-[#5E7052] px-1">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
