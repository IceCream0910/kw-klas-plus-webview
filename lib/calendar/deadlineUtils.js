/**
 * 마감일 관련 유틸리티 함수들
 */

/**
 * hourGap 기준으로 정렬
 */
export const sortByHourGap = (items) => {
    return [...items].sort((a, b) => a.hourGap - b.hourGap);
};

/**
 * 마감일 데이터 처리 및 정렬
 */
export const processDeadlineData = (data) => {
    // 시작일이 있는 항목이 있는지 확인
    const hasStartDate = data.some(item =>
        item.onlineLecture.some(lecture => lecture.startDate) ||
        item.task.some(task => task.startDate) ||
        item.teamTask.some(teamTask => teamTask.startDate)
    );

    const processedData = data.map(course => ({
        ...course,
        onlineLecture: sortByHourGap(course.onlineLecture),
        task: sortByHourGap(course.task),
        teamTask: sortByHourGap(course.teamTask),
        minHourGap: Math.min(
            course.onlineLecture[0]?.hourGap ?? Infinity,
            course.task[0]?.hourGap ?? Infinity,
            course.teamTask[0]?.hourGap ?? Infinity
        )
    })).sort((a, b) => a.minHourGap - b.minHourGap);

    return {
        data: processedData,
        hasStartDate
    };
};

/**
 * 아직 시작되지 않은 항목 필터링
 */
export const filterUnstartedItems = (data) => {
    const now = new Date();

    return data.map(course => ({
        ...course,
        onlineLecture: filterStartedItems(course.onlineLecture, now),
        task: filterStartedItems(course.task, now),
        teamTask: filterStartedItems(course.teamTask, now)
    }));
};

/**
 * 시작된 항목들만 필터링
 */
export const filterStartedItems = (items, now) => {
    return items.filter(item => !item.startDate || new Date(item.startDate) <= now);
};

/**
 * 빈 강의 필터링 (모든 항목이 비어있는 강의 제거)
 */
export const filterEmptyDeadlines = (data) => {
    return data.filter(item =>
        item.onlineLecture.length > 0 ||
        item.task.length > 0 ||
        item.teamTask.length > 0
    );
};

/**
 * 최소 hourGap 업데이트
 */
export const updateMinHourGap = (data) => {
    return data.map(course => ({
        ...course,
        minHourGap: Math.min(
            course.onlineLecture[0]?.hourGap ?? Infinity,
            course.task[0]?.hourGap ?? Infinity,
            course.teamTask[0]?.hourGap ?? Infinity
        )
    })).sort((a, b) => a.minHourGap - b.minHourGap);
};

/**
 * 마감일 필터링 (시작되지 않은 항목 제외 여부에 따라)
 */
export const applyDeadlineFilters = (data, excludeUnstarted) => {
    let filteredData = excludeUnstarted ? filterUnstartedItems(data) : data;
    filteredData = filterEmptyDeadlines(filteredData);
    filteredData = updateMinHourGap(filteredData);
    return filteredData;
};
