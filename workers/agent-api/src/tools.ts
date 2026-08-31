export const AGENT_TOOLS = [
  tool("getSubjectList", "현재 학기의 수강 과목 목록을 조회합니다."),
  tool("searchCourseInfo", "선택한 과목의 강의실과 담당교수 등 강의 정보를 조회합니다.", courseSchema()),
  tool("searchTaskList", "선택한 과목의 과제 목록과 제출 기한을 조회합니다.", courseSchema()),
  tool("getGrades", "사용자의 전체 학기 성적과 취득 학점을 조회합니다."),
  tool("getRanking", "사용자의 학기별 석차를 조회합니다."),
  tool("getScholarships", "사용자의 장학 수혜 내역을 조회합니다."),
  tool("getStudentProfile", "사용자의 학적 정보와 학생 학습현황 정보를 조회합니다."),
  tool("getAdvisor", "지정한 학기의 지도교수 정보를 조회합니다.", yearHakgiSchema()),
  tool("getLectureSchedule", "특정 수강 과목의 강의 시간과 강의실을 조회합니다.", lectureContextSchema()),
  tool("getOnlineLectures", "특정 수강 과목의 온라인 강의 콘텐츠와 진도 상태를 조회합니다.", lectureContextSchema()),
  tool("getKLASNotices", "KLAS가 사용자에게 보낸 수업·학사 알림을 페이지 단위로 조회합니다.", {
    type: "object",
    properties: { page: { type: "integer", minimum: 0, maximum: 100 } },
    required: ["page"], additionalProperties: false
  }),
  tool("getLectureBoardList", "특정 과목의 공지사항, 묻고답하기, 강의자료실 또는 수강생자료실 게시글을 조회합니다.", boardListSchema()),
  tool("getLectureBoardDetail", "강의 게시판의 특정 게시글 본문을 조회합니다.", boardDetailSchema()),
  tool("getBoardAttachments", "강의 게시글의 첨부파일 목록을 조회합니다.", {
    type: "object", properties: { attachId: { type: "string", minLength: 1, maxLength: 100 } },
    required: ["attachId"], additionalProperties: false
  }),
  tool("getLecturePlanFilters", "강의계획서 검색에 사용하는 공통과목, 학과, 전공 목록을 조회합니다.", {
    type: "object",
    properties: {
      year: { type: "integer", minimum: 2000, maximum: 2100 },
      hakgi: { type: "integer", minimum: 1, maximum: 4 },
      departmentCode: { type: ["string", "null"], maxLength: 40 }
    },
    required: ["year", "hakgi", "departmentCode"], additionalProperties: false
  }),
  tool("searchLecturePlans", "연도, 학기, 과목명, 교수명, 공통과목, 학과, 전공 조건으로 강의계획서를 검색합니다.", lecturePlanSearchSchema()),
  tool("getLecturePlanDetail", "과목 코드로 강의계획서의 수업시간, 담당교원, 선수과목 등 전체 상세 정보를 조회합니다.", {
    type: "object", properties: { courseCode: { type: "string", minLength: 1, maxLength: 100 } },
    required: ["courseCode"], additionalProperties: false
  }),
  tool("getCalendarEvents", "지정한 달의 KLAS 개인 일정을 조회합니다.", {
    type: "object",
    properties: {
      year: { type: "integer", minimum: 2020, maximum: 2100 },
      month: { type: "integer", minimum: 1, maximum: 12 }
    },
    required: ["year", "month"],
    additionalProperties: false
  }),
  tool("createCalendarEvent", "KLAS 개인 일정을 추가합니다. 사용자에게 실행 직전 승인을 받아야 합니다.", calendarSchema(false)),
  tool("updateCalendarEvent", "기존 KLAS 개인 일정을 수정합니다. 사용자에게 실행 직전 승인을 받아야 합니다.", calendarSchema(true)),
  tool("deleteCalendarEvent", "기존 KLAS 개인 일정을 삭제합니다. 사용자에게 실행 직전 승인을 받아야 합니다.", calendarSchema(true)),
  tool("getKWNoticeList", "광운대학교의 최신 공지사항 목록을 조회합니다."),
  tool("searchKWNoticeList", "광운대학교 공지사항을 검색합니다.", {
    type: "object",
    properties: { query: { type: "string", minLength: 1, maxLength: 100 } },
    required: ["query"],
    additionalProperties: false
  }),
  tool("getSchedules", "광운대학교 공식 학사일정을 조회합니다."),
  tool("getHaksik", "오늘의 교내 식당 메뉴를 조회합니다."),
  tool("getHomepageSitemap", "광운대학교 홈페이지에서 탐색 가능한 페이지 목록을 조회합니다."),
  tool("getContentFromUrl", "광운대학교 공식 홈페이지 페이지의 본문을 읽습니다. 사이트맵에서 찾은 URL에만 사용합니다.", {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 3
      }
    },
    required: ["urls"],
    additionalProperties: false
  }),
  tool("getPortalMenus", "사용 가능한 KLAS 및 KLAS+ 메뉴와 이동 주소를 조회합니다.")
] as const;

export const WRITE_TOOL_NAMES = new Set(["createCalendarEvent", "updateCalendarEvent", "deleteCalendarEvent"]);

function yearHakgiSchema() {
  return {
    type: "object", properties: { yearHakgi: { type: "string", pattern: "^20\\d{2},[1-4]$" } },
    required: ["yearHakgi"], additionalProperties: false
  } as const;
}

function lectureContextSchema() {
  return {
    type: "object",
    properties: {
      yearHakgi: { type: "string", pattern: "^20\\d{2},[1-4]$" },
      courseCode: { type: "string", minLength: 1, maxLength: 100 }
    },
    required: ["yearHakgi", "courseCode"], additionalProperties: false
  } as const;
}

function boardListSchema() {
  return {
    type: "object",
    properties: {
      ...lectureContextSchema().properties,
      boardType: { type: "string", enum: ["notice", "qna", "materials", "studentMaterials"] },
      page: { type: "integer", minimum: 0, maximum: 100 }
    },
    required: ["yearHakgi", "courseCode", "boardType", "page"], additionalProperties: false
  } as const;
}

function boardDetailSchema() {
  return {
    type: "object",
    properties: {
      ...lectureContextSchema().properties,
      boardType: { type: "string", enum: ["notice", "qna", "materials", "studentMaterials"] },
      boardNo: { type: "string", minLength: 1, maxLength: 100 },
      masterNo: { type: "string", minLength: 1, maxLength: 100 }
    },
    required: ["yearHakgi", "courseCode", "boardType", "boardNo", "masterNo"], additionalProperties: false
  } as const;
}

function lecturePlanSearchSchema() {
  return {
    type: "object",
    properties: {
      year: { type: "integer", minimum: 2000, maximum: 2100 }, hakgi: { type: "integer", minimum: 1, maximum: 4 },
      onlyMine: { type: "boolean" }, courseName: { type: ["string", "null"], maxLength: 100 },
      professor: { type: ["string", "null"], maxLength: 100 }, commonSubjectCode: { type: ["string", "null"], maxLength: 40 },
      departmentCode: { type: ["string", "null"], maxLength: 40 }, majorCode: { type: ["string", "null"], maxLength: 40 }
    },
    required: ["year", "hakgi", "onlyMine", "courseName", "professor", "commonSubjectCode", "departmentCode", "majorCode"],
    additionalProperties: false
  } as const;
}

function calendarSchema(requireId: boolean) {
  const properties: Record<string, unknown> = {
    title: { type: "string", minLength: 1, maxLength: 100 }, place: { type: ["string", "null"], maxLength: 100 },
    startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    startHour: { type: "integer", minimum: 0, maximum: 23 }, startMinute: { type: "integer", minimum: 0, maximum: 59 },
    endHour: { type: "integer", minimum: 0, maximum: 23 }, endMinute: { type: "integer", minimum: 0, maximum: 59 },
    color: { type: ["string", "null"], pattern: "^#[0-9A-Fa-f]{6}$" }
  };
  if (requireId) properties.scheduleId = { type: "string", minLength: 1, maxLength: 100 };
  return {
    type: "object", properties,
    required: ["title", "place", "startDate", "endDate", "startHour", "startMinute", "endHour", "endMinute", "color", ...(requireId ? ["scheduleId"] : [])],
    additionalProperties: false
  } as const;
}

function courseSchema() {
  return {
    type: "object",
    properties: {
      courseName: { type: "string" },
      courseLabel: { type: "string" },
      courseCode: { type: "string" }
    },
    required: ["courseName", "courseLabel", "courseCode"],
    additionalProperties: false
  } as const;
}

function tool(name: string, description: string, parameters: Record<string, unknown> = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false
}) {
  return { type: "function", name, description, strict: true, parameters };
}
