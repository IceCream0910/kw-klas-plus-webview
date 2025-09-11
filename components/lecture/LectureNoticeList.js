import React from "react";
import { motion } from "framer-motion";
import Card from '../common/Card';
import IonIcon from '@reacticons/ionicons';

/**
 * 강의 공지사항 목록 컴포넌트
 */
const LectureNoticeList = ({ notices, title, onAddClick, emptyMessage = "아직 항목이 없어요" }) => {
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg width="64" height="41" viewBox="0 0 64 41" className="mb-4" fill="currentColor">
                <g transform="translate(0 1)" fillRule="evenodd">
                    <g fillRule="nonzero" stroke="currentColor">
                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="currentColor" fillOpacity="0.1"></path>
                    </g>
                </g>
            </svg>
            <span className="text-sm">{emptyMessage}</span>
        </div>
    );

    return (
        <div className="mb-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {onAddClick && (
                    <button
                        onClick={onAddClick}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <IonIcon name="add-outline" className="text-gray-600" />
                    </button>
                )}
            </div>

            {/* 목록 */}
            <Card>
                {notices && notices.length > 0 ? (
                    <div className="divide-y">
                        {notices.map((notice, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-800 leading-tight">
                                        {notice.title || notice.papernm}
                                    </h4>

                                    {/* 날짜 정보 */}
                                    {(notice.regdate || notice.started || notice.sdates) && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <IonIcon name="time-outline" className="mr-1" />
                                            <span>
                                                {notice.regdate ||
                                                    (notice.started && notice.ended ? `${notice.started} ~ ${notice.ended}` : '') ||
                                                    (notice.sdates && notice.edates ? `${notice.sdates} ~ ${notice.edates}` : '')}
                                            </span>
                                        </div>
                                    )}

                                    {/* 추가 정보 */}
                                    {notice.submit && (
                                        <div className="flex items-center text-sm">
                                            <IonIcon name="checkmark-outline" className="mr-1" />
                                            <span className={notice.submit === 'Y' ? 'text-green-600' : 'text-red-600'}>
                                                {notice.submit === 'Y' ? '제출 완료' : '미제출'}
                                            </span>
                                        </div>
                                    )}

                                    {notice.toroncnt && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <IonIcon name="chatbubble-outline" className="mr-1" />
                                            <span>토론 {notice.toroncnt}개</span>
                                        </div>
                                    )}

                                    {/* 내용 미리보기 */}
                                    {notice.content && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                            {notice.content}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </Card>
        </div>
    );
};

export default LectureNoticeList;
