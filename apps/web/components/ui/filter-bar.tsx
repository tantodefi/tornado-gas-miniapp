import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
export interface FilterState {
  network: string;
  amountRange: string;
  memberRange: string;
  sortBy: string;
}

const FilterBar: React.FC<{
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  poolCount: number;
  isLoading?: boolean;
}> = ({ filters, onFilterChange, poolCount, isLoading = false }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div className="px-4 py-3 sm:p-6 lg:p-8 relative z-10 mb-6 sm:mb-8">
      {/* Mobile Layout with Dropdown */}
      <div className="block sm:hidden" ref={dropdownRef}>
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-400">
            {isLoading ? (
              <span>Loading cards...</span>
            ) : (
              <>
                <span className="text-purple-400 font-semibold">
                  {poolCount}
                </span>{" "}
                cards
              </>
            )}
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-200 text-xs font-mono hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Filter</span>
            <span
              className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isFilterOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-full mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg p-4 shadow-xl z-50"
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Network
                </label>
                <select
                  value={filters.network}
                  onChange={(e) => onFilterChange("network", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="">All Networks</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="base">Base Sepolia</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Amount
                </label>
                <select
                  value={filters.amountRange}
                  onChange={(e) =>
                    onFilterChange("amountRange", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="">All Amounts</option>
                  <option value="0-0.01">0-0.01 ETH</option>
                  <option value="0.01-0.05">0.01-0.05 ETH</option>
                  <option value="0.05-0.1">0.05-0.1 ETH</option>
                  <option value="0.1+">0.1+ ETH</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Pool Size
                </label>
                <select
                  value={filters.memberRange}
                  onChange={(e) =>
                    onFilterChange("memberRange", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="">All Sizes</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="newest">Newest</option>
                  <option value="amount-high">High Amount</option>
                  <option value="amount-low">Low Amount</option>
                  <option value="members-high">Most Members</option>
                  <option value="members-low">Least Members</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-600/30">
                <button
                  onClick={() => {
                    onFilterChange("network", "");
                    onFilterChange("amountRange", "");
                    onFilterChange("memberRange", "");
                    onFilterChange("sortBy", "newest");
                  }}
                  className="flex-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-3 py-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-mono"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex justify-between items-center">
        <div className="text-sm text-slate-400">
          {isLoading ? (
            <span>Loading cards...</span>
          ) : (
            <>
              <span className="text-purple-400 font-semibold">{poolCount}</span>{" "}
              cards available
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:gap-4 xl:gap-6">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            disabled={isLoading}
            className="px-2 py-1 text-slate-200 text-sm focus:outline-none focus:text-purple-400 font-mono cursor-pointer hover:text-purple-400 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="newest">Newest</option>
            <option value="amount-high">High Amount</option>
            <option value="amount-low">Low Amount</option>
            <option value="members-high">Most Members</option>
            <option value="members-low">Least Members</option>
          </select>

          <select
            value={filters.memberRange}
            onChange={(e) => onFilterChange("memberRange", e.target.value)}
            disabled={isLoading}
            className="px-2 py-1 text-slate-200 text-sm focus:outline-none focus:text-purple-400 font-mono cursor-pointer hover:text-purple-400 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <select
            value={filters.amountRange}
            onChange={(e) => onFilterChange("amountRange", e.target.value)}
            disabled={isLoading}
            className="px-2 py-1 text-slate-200 text-sm focus:outline-none focus:text-purple-400 font-mono cursor-pointer hover:text-purple-400 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Amounts</option>
            <option value="0-0.01">0-0.01 ETH</option>
            <option value="0.01-0.05">0.01-0.05 ETH</option>
            <option value="0.05-0.1">0.05-0.1 ETH</option>
            <option value="0.1+">0.1+ ETH</option>
          </select>

          <select
            value={filters.network}
            onChange={(e) => onFilterChange("network", e.target.value)}
            disabled={isLoading}
            className="px-2 py-1 text-slate-200 text-sm focus:outline-none focus:text-purple-400 font-mono cursor-pointer hover:text-purple-400 transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Networks</option>
            <option value="ethereum">Ethereum</option>
            <option value="base">Base Sepolia</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
