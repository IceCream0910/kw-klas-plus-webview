
export const getScholarshipStatusColor = (status) => {
    const statusColors = {
        "선발완료": "#22c55e",
        "심사중": "#f59e0b",
        "미선발": "#ef4444",
        "신청완료": "#3b82f6",
        "신청가능": "#10b981"
    };

    return statusColors[status] || "#6b7280";
};

export const getScholarshipStatusBgColor = (status) => {
    const statusBgColors = {
        "선발완료": "#dcfce7",
        "심사중": "#fef3c7",
        "미선발": "#fecaca",
        "신청완료": "#dbeafe",
        "신청가능": "#d1fae5"
    };

    return statusBgColors[status] || "#f3f4f6";
};

export const parseScholarshipData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((scholarship, index) => ({
        id: scholarship.id || index,
        title: scholarship.title || "제목 없음",
        period: scholarship.period || "기간 미정",
        status: scholarship.status || "상태 미정",
        amount: scholarship.amount || "",
        department: scholarship.department || "",
        grade: scholarship.grade || "",
        description: scholarship.description || ""
    }));
};

export const filterScholarships = (scholarships, filter) => {
    if (!filter || filter === "전체") return scholarships;

    return scholarships.filter(scholarship =>
        scholarship.status === filter
    );
};

export const sortScholarships = (scholarships, sortBy = "period") => {
    return [...scholarships].sort((a, b) => {
        switch (sortBy) {
            case "period":
                return new Date(b.period) - new Date(a.period);
            case "title":
                return a.title.localeCompare(b.title);
            case "status":
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });
};

export const getScholarshipStatusMessage = (status) => {
    const messages = {
        "선발완료": "축하합니다! 선발이 완료되었습니다.",
        "심사중": "심사가 진행 중입니다.",
        "미선발": "아쉽게도 선발되지 않았습니다.",
        "신청완료": "신청이 완료되었습니다.",
        "신청가능": "신청 가능한 장학금입니다."
    };

    return messages[status] || "";
};
