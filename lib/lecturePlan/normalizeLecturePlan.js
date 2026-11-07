export function normalizeLecturePlan(values) {
    if (!Array.isArray(values?.lecturePlan) || !values.lecturePlan[0]) return null;
    const normalized = { ...values, lectureStdCrtNum: values.lectureStdCrtNum || {} };
    for (const key of ['lectureTime', 'lectureAssistant', 'lectureTeam', 'lectureEngineerCourse', 'lecturePlanTab4', 'lecturePrerequisite', 'lecturePlanTab6']) {
        normalized[key] = Array.isArray(values[key]) ? values[key] : [];
    }
    return normalized;
}
