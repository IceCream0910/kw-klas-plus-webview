import React from "react";
import { motion } from "framer-motion";
import Card from '../common/Card';
import { getScholarshipStatusColor, getScholarshipStatusBgColor } from "../../lib/scholarship/scholarshipUtils";

const ScholarshipCard = ({ scholarship, onClick, index = 0 }) => {
    const statusColor = getScholarshipStatusColor(scholarship.status);
    const statusBgColor = getScholarshipStatusBgColor(scholarship.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onClick && onClick(scholarship)}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <Card className="mb-4 hover:shadow-md transition-all duration-200">
                <div className="p-4">
                    {/* 제목과 상태 */}
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-3">
                            {scholarship.title}
                        </h3>
                        <div
                            className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: statusBgColor,
                                color: statusColor,
                            }}
                        >
                            {scholarship.status}
                        </div>
                    </div>

                    {/* 기간 정보 */}
                    {scholarship.period && (
                        <div className="flex items-center mb-2 text-gray-600">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-sm">{scholarship.period}</span>
                        </div>
                    )}

                    {/* 장학금액 */}
                    {scholarship.amount && (
                        <div className="flex items-center mb-2 text-gray-600">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                            <span className="text-sm font-medium">{scholarship.amount}</span>
                        </div>
                    )}

                    {/* 학과 및 학년 */}
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                        {scholarship.department && (
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                {scholarship.department}
                            </span>
                        )}
                        {scholarship.grade && (
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                {scholarship.grade}
                            </span>
                        )}
                    </div>

                    {/* 설명 */}
                    {scholarship.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {scholarship.description}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default ScholarshipCard;
