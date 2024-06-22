const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

let sessionId = null;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { conversation, subjList, token } = req.body;
        sessionId = token;
        const response = await processChatRequest(conversation, subjList);
        res.status(200).json({ message: response });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const processChatRequest = async (conversation, subjList) => {
    const messages = [
        {
            role: "system",
            content: `
            You are an AI chatbot designed to assist students of 광운대학교. Your name is 'KLAS Bot'. \
            You can provide details on course attendance, recent announcements, online lecture lists, assignments, and resources. \
            You can also retrieve detailed information about assignments and announcements. \
            
            The functions you can call and their purposes are listed below: \
            - searchCourseInfo : 해당 강의의 출석 현황(O:출석, X:결석, L:지각, A:공결), 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 조회 \
            - searchTaskList : 해당 강의의 과제 목록 조회. 각 과제에 대해 제출 상태, 마감 기한, 과제 제목 조회 가능 \
            - searchTaskDetail : 과제 상세 내용 조회. 과제 목록 조회 실행 이후에만 호출 가능 \

            Course code are required parameters for all functions. 다음은 현재 사용자가 듣고 있는 과목들이야. courseCode, courseName, courseLabel(e.g. 상상공학과표현 (0000-1-7461-02) - 김형국)은 아래 객체에서 각각 value, name, label의 값을 그대로 사용해서 function을 호출해야 해.  \
            ${JSON.stringify(subjList)}
            
            파라미터가 불확실한 경우 임의로 가정하지 말고, 사용자에게 재확인해. \
            답변에는 호출하는 function의 이름이나 구체적 내용과 같은 작동 방식 정보를 포함하지 마.
            user가 사용하는 언어로 답변해.
            `,
        },
        ...conversation.map(item => ({
            role: item.type === 'question' ? 'user' : 'assistant',
            content: item.content
        }))
    ];

    let response = await callChatCompletion(messages);
    let functionCalls = [];

    console.log(response);

    while (response.choices[0].finish_reason === "function_call") {
        const functionCall = response.choices[0].message.function_call;
        functionCalls.push(functionCall);

        const functionResponse = await executeFunctionCall(functionCall);
        messages.push({
            role: "function",
            name: functionCall.name,
            content: JSON.stringify(functionResponse),
        });

        response = await callChatCompletion(messages);
    }

    if (functionCalls.length > 0) {
        const finalPrompt = `Based on the information retrieved from the function calls, please provide a comprehensive response to the user's query. user의 질문에 맞는 정보만 포함해서 답변해.\
        - searchCourseInfo : 출석정보(atendSubList, 회차는 pgr1, pgr2..로 표시), 최근 공지사항(noticeList), 온라인 강의 리스트(cntntList), 과제 개수(taskCnt)`;
        messages.push({ role: "system", content: finalPrompt });
        console.log(messages)
        response = await callChatCompletion(messages);
    }

    return response.choices[0].message.content;
};

// The rest of the code (callChatCompletion, executeFunctionCall, and mock functions) remains the same

const callChatCompletion = async (messages) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            functions: [
                {
                    name: "searchCourseInfo",
                    description: "해당 강의의 출석 현황, 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 종합 조회",
                    parameters: {
                        type: "object",
                        properties: {
                            courseName: { type: "string" },
                            courseLabel: { type: "string" },
                            courseCode: { type: "string" }
                        },
                        required: ["courseCode", "courseName", "courseLabel"]
                    }
                },
                {
                    name: "searchTaskList",
                    description: "해당 강의의 과제 목록 조회",
                    parameters: {
                        type: "object",
                        properties: {
                            courseName: { type: "string" },
                            courseLabel: { type: "string" },
                            courseCode: { type: "string" }
                        },
                        required: ["courseCode", "courseName", "courseLabel"]
                    }
                },
                {
                    name: "searchTaskDetail",
                    description: "과제 상세 내용 조회",
                    parameters: {
                        type: "object",
                        properties: {
                            courseName: { type: "string" },
                            courseLabel: { type: "string" },
                            courseCode: { type: "string" },
                            ordseq: { type: "string" }
                        },
                        required: ["courseCode", "ordseq", "courseName", "courseLabel"]
                    }
                },
            ],
        }),
    });
    return response.json();
};

const executeFunctionCall = async (functionCall) => {
    const args = JSON.parse(functionCall.arguments);
    console.log(args);
    switch (functionCall.name) {
        case "searchCourseInfo":
            return await searchCourseInfo(args);
        case "searchTaskList":
            return await searchTaskList(args);
        case "searchTaskDetail":
            return await searchTaskDetail(args);
        default:
            return { error: "Unknown function" };
    }
};



// 강의 종합 정보
async function searchCourseInfo({ courseName, courseLabel, courseCode }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{
  "selectYearhakgi": "${getCurrentYear()},${getCurrentSemester()}",
  "selectSubj": "${courseCode}",
  "selectChangeYn": "Y",
  "subjNm": "${courseLabel}",
  "subj": {
    "value": "${courseCode}",
    "label": "${courseLabel}",
    "name": "${courseName}"
  }
}`
    };

    console.log(options.body)

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

async function searchTaskList({ courseName, courseLabel, courseCode }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{
  "selectYearhakgi": "${getCurrentYear()},${getCurrentSemester()}",
  "selectSubj": "${courseCode}",
  "selectChangeYn": "Y",
  "subjNm": "${courseLabel}",
  "subj": {
    "value": "${courseCode}",
    "label": "${courseLabel}",
    "name": "${courseName}"
  }
}`
    };

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/TaskStdList.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

async function searchTaskDetail({ courseName, courseLabel, courseCode, ordseq }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{
  "ordseq": "${ordseq}",
   "selectSubj": "${courseCode}",
  "selectChangeYn": "Y",
  "subjNm": "${courseLabel}",
  "subj": {
    "value": "${courseCode}",
    "label": "${courseLabel}",
    "name": "${courseName}"
  }
}`
    };

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/TaskStdView.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

/*
async function searchCourseNoticeList({ courseCode }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{"subj":{"value":"${courseCode}"}}`
    };

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/TaskStdList.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

async function searchCourseNoticeDetail({ courseCode, boardNo }) {
    return "중간고사는 5월 10일에 실시됩니다. 시험 범위는 1주차부터 7주차까지의 내용입니다.";
}
    */

function getCurrentYear() {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

function getCurrentSemester() {
    const currentMonth = new Date().getMonth();
    return currentMonth < 7 ? "1" : "2";
}