import React from "react";
import { Search, Filter } from "lucide-react";

const SearchBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
      <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
        <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: 42 }}
          placeholder="Search by student name, ID, route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {setStatusFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={18} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: "auto", minWidth: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
