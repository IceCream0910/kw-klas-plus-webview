import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import { getAttendanceColor } from "../../lib/lectureUtils";

/**
 * 출석 현황 카드 컴포넌트
 */
const AttendanceCard = ({ attendanceData, stats, isExpanded, onToggleExpand }) => {
    if (!attendanceData || !stats) return null;

    return (
        <Card className="mb-4">
            <div className="p-4">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">출석 현황</h3>
                    <button
                        onClick={onToggleExpand}
                        className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {isExpanded ? '접기' : '상세보기'}
                    </button>
                </div>

                {/* 출석률 요약 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.attendanceRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">출석률</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                            {stats.totalClasses}회
                        </div>
                        <div className="text-sm text-gray-600">총 수업</div>
                    </div>
                </div>

                {/* 상세 통계 */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="font-semibold text-green-600">출석</div>
                        <div className="text-green-800">{stats.totalClasses - stats.lateCount - stats.absentCount}회</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <div className="font-semibold text-yellow-600">지각</div>
                        <div className="text-yellow-800">{stats.lateCount}회</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="font-semibold text-red-600">결석</div>
                        <div className="text-red-800">{stats.absentCount}회</div>
                    </div>
                </div>

                {/* 출석 상세 내역 */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                    >
                        <h4 className="font-semibold text-gray-700 mb-3">출석 기록</h4>
                        <div className="space-y-2">
                            {attendanceData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium">{item.dates || `${index + 1}주차`}</span>
                                    <div className="flex space-x-2">
                                        {['pgr1', 'pgr2', 'pgr3', 'pgr4'].map((key, idx) => {
                                            const status = item[key];
                                            if (!status || status === '-') return null;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ backgroundColor: getAttendanceColor(status) }}
                                                >
                                                    {status}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </Card>
    );
};

export default AttendanceCard;
