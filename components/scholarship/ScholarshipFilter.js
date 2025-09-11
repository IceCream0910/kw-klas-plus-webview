import React from "react";
import { motion } from "framer-motion";

const ScholarshipFilter = ({ activeFilter, onFilterChange, scholarshipCounts }) => {
    const filters = [
        { key: "전체", label: "전체", color: "#6b7280" },
        { key: "신청가능", label: "신청가능", color: "#10b981" },
        { key: "신청완료", label: "신청완료", color: "#3b82f6" },
        { key: "심사중", label: "심사중", color: "#f59e0b" },
        { key: "선발완료", label: "선발완료", color: "#22c55e" },
        { key: "미선발", label: "미선발", color: "#ef4444" }
    ];

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">상태별 필터</h3>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.key;
                    const count = scholarshipCounts[filter.key] || 0;

                    return (
                        <motion.button
                            key={filter.key}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onFilterChange(filter.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                ? "text-white shadow-md"
                                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                }`}
                            style={{
                                backgroundColor: isActive ? filter.color : undefined,
                            }}
                        >
                            {filter.label}
                            {count > 0 && (
                                <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-white bg-opacity-20" : "bg-gray-200"
                                        }`}
                                >
                                    {count}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default ScholarshipFilter;
