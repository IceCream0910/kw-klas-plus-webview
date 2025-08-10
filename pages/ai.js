import { useState, useEffect, useRef, use } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import IonIcon from '@reacticons/ionicons';
import LoadingComponent from './components/loader';
import Spacer from './components/spacer';
import Header from './components/header';
import remarkGfm from 'remark-gfm'

export default function AI() {
    const [subjList, setSubjList] = useState(null);
    const [input, setInput] = useState('');
    const [token, setToken] = useState("");
    const [chat, setChat] = useState([
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTools, setActiveTools] = useState([]);
    const scrollRef = useRef(null);
    const abortControllerRef = useRef(null);
    const [randomSubjName, setRandomSubjName] = useState(null);
    const [yearHakgi, setYearHakgi] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const pendingToolsRef = useRef([]);
    const [messageToolsMap, setMessageToolsMap] = useState({});
    const [remainingQuestions, setRemainingQuestions] = useState(5);
    const MAX_DAILY_QUESTIONS = process.env.NEXT_PUBLIC_MAX_DAILY_QUESTIONS || 7;

    const checkRemainingQuestions = () => {
        const today = new Date().toISOString().split('T')[0];
        const storedData = localStorage.getItem('klasGptQuestionLimit');

        if (!storedData || !storedData.startsWith(today)) {
            localStorage.setItem('klasGptQuestionLimit', `${today}_0`);
            setRemainingQuestions(MAX_DAILY_QUESTIONS);
            return MAX_DAILY_QUESTIONS;
        } else {
            const count = parseInt(storedData.split('_')[1], 10);
            const remaining = Math.max(0, MAX_DAILY_QUESTIONS - count);
            setRemainingQuestions(remaining);
            return remaining;
        }
    };

    useEffect(() => {
        checkRemainingQuestions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const remaining = checkRemainingQuestions();
        if (remaining <= 0) {
            setChat(prevChat => [...prevChat, {
                type: 'answer',
                content: '⚠️ 일일 질문 한도인 5회를 모두 사용하셨습니다. 내일 다시 이용해 주세요.',
                id: Date.now()
            }]);
            return;
        }

        if (input.trim()) {
            const today = new Date().toISOString().split('T')[0];
            const storedData = localStorage.getItem('klasGptQuestionLimit');
            const currentCount = storedData ? parseInt(storedData.split('_')[1], 10) : 0;
            localStorage.setItem('klasGptQuestionLimit', `${today}_${currentCount + 1}`);

            setRemainingQuestions(MAX_DAILY_QUESTIONS - (currentCount + 1));

            const newQuestion = { type: 'question', content: input.trim() };
            setChat(prevChat => [...prevChat, newQuestion]);
            setInput('');
            setIsLoading(true);
            setIsInputFocused(false);
            await sendMessage([...chat, newQuestion]);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setYearHakgi(urlParams.get('yearHakgi'));

        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };

        try {

        } catch (error) {
            console.log("not app");
        }
    }, []);

    useEffect(() => {
        window.receiveSubjList = function (receivedSubjList) {
            if (!receivedSubjList) return;

            const filteredSubjList = JSON.parse(receivedSubjList).filter(subj => subj.value == yearHakgi);
            try {
                setSubjList(filteredSubjList[0].subjList);
                setRandomSubjName(filteredSubjList[0].subjList[Math.floor(Math.random() * filteredSubjList[0].subjList.length)].name);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
    }, [yearHakgi]);


    const sendMessage = async (conversation) => {
        try {
            abortControllerRef.current = new AbortController();
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation, subjList: JSON.stringify(subjList), token, yearHakgi }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const newAnswerIndex = chat.length;
            const messageId = Date.now();

            setChat(prev => [...prev, { type: 'answer', content: '', id: messageId }]);
            setActiveTools([]);
            setMessageToolsMap(prev => ({ ...prev, [messageId]: [] }));

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunkValue = decoder.decode(value);
                const lines = chunkValue.split('\n\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const data = JSON.parse(line.slice(6));

                        switch (data.type) {
                            case 'content':
                                setChat(prev => {
                                    const newChat = [...prev];
                                    const lastMessage = newChat[newChat.length - 1];
                                    lastMessage.content += data.message;
                                    return newChat;
                                });
                                break;

                            case 'tool_start':
                                setActiveTools(tools => [
                                    ...tools,
                                    {
                                        name: data.tool,
                                        title: data.name,
                                        input: data.input,
                                        status: 'running',
                                    }
                                ]);

                                setMessageToolsMap(prev => {
                                    const updatedMap = { ...prev };
                                    if (!updatedMap[messageId]) updatedMap[messageId] = [];
                                    updatedMap[messageId].push({
                                        name: data.tool,
                                        title: data.name,
                                        input: data.input,
                                        status: 'running',
                                    });
                                    return updatedMap;
                                });
                                break;

                            case 'tool_end':
                                setActiveTools(tools => tools.map(tool =>
                                    tool.name === data.tool
                                        ? { ...tool, status: 'completed' }
                                        : tool
                                ));

                                setMessageToolsMap(prev => {
                                    const updatedMap = { ...prev };
                                    if (updatedMap[messageId]) {
                                        updatedMap[messageId] = updatedMap[messageId].map(tool =>
                                            tool.name === data.tool
                                                ? { ...tool, status: 'completed', output: data.output }
                                                : tool
                                        );
                                    }
                                    return updatedMap;
                                });

                                pendingToolsRef.current.push({
                                    type: 'tool',
                                    content: JSON.stringify(data.output)
                                });
                                break;

                            case 'complete':
                                if (pendingToolsRef.current.length > 0) {
                                    console.log("Pending tools:", pendingToolsRef.current);
                                    setTimeout(() => {
                                        setChat(prev => {
                                            const newChat = [...prev];
                                            pendingToolsRef.current.forEach(tool => {
                                                newChat.push(tool);
                                            });
                                            pendingToolsRef.current = [];
                                            return newChat;
                                        });
                                    }, 100);
                                }
                                setIsLoading(false);
                                break;

                            case 'error':
                                setChat(prev => [...prev, {
                                    type: 'answer',
                                    content: `⚠️ 오류 발생: ${data.message}`
                                }]);
                                setIsLoading(false);
                                break;
                        }
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopResponse = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, activeTools]);

    return (
        <div>
            <Head>
                <title>KLAS GPT</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header title={<h2>KLAS AI</h2>} />

            <main>
                <div className='messages-container' ref={scrollRef}>
                    {chat.length === 0 && (
                        <>
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Spacer y={50} />
                                <h2>안녕! 저는 KLAS GPT예요.</h2>
                                <span style={{ opacity: .6, fontSize: '14px', marginTop: '5px', textAlign: 'center', width: '90%', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>무엇이든 물어보세요. KLAS와 학교 홈페이지에 있는 정보를 기반으로 답변해줄게요.</span>
                                <Spacer y={20} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                    {randomSubjName && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const questions = ['출석 현황 알려줘', '강의 공지사항 알려줘', '미제출 과제 있어?'];
                                                    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
                                                    setInput(`${randomSubjName} ${randomQuestion}`);
                                                }}
                                                className='recommend-badge'>
                                                <span><IonIcon name="checkmark-outline" /></span>
                                                강의 정보 확인
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            const questions = ['최근 학교 공지사항 정리해줘', '수강신청 관련 공지사항 찾아줘', '공지사항에 공모전 정보 올라온 거 있는지 확인해줘'];
                                            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
                                            setInput(randomQuestion);
                                        }}
                                        className='recommend-badge'>
                                        <span><IonIcon name="notifications-outline" /></span>
                                        학교 공지사항
                                    </button>
                                    <button
                                        onClick={() => setInput('오늘의 학식 메뉴')}
                                        className='recommend-badge'>
                                        <span><IonIcon name="fast-food-outline" /></span>
                                        학식 메뉴
                                    </button>
                                    <button
                                        onClick={() => {
                                            const questions = [`${new Date().getMonth() + 1}월 학사일정 정리해줘`, '이번 학기 중간고사 기간 언제야?', '올해 월계 축전 언제해?'];
                                            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
                                            setInput(`${randomQuestion}`);
                                        }}
                                        className='recommend-badge'>
                                        <span><IonIcon name="calendar-outline" /></span>
                                        학사일정
                                    </button>
                                    <button
                                        onClick={() => {
                                            const questions = ['학생증 신청 방법 알려줘', '코딩 관련 중앙동아리에는 어떤 게 있어?', '인공지능융합대학에 대한 정보를 찾아서 요약해줘'];
                                            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
                                            setInput(`${randomQuestion}`);
                                        }}
                                        className='recommend-badge'>
                                        <span><IonIcon name="school-outline" /></span>
                                        학교 정보
                                    </button>
                                </div>
                                <br />
                            </div>
                        </>
                    )}
                    {chat.map((item, index) => (
                        <div key={index} className={`message`}>
                            {/* 기존 단순 로딩 컴포넌트 제거 및 skeleton/스피너 논리 추가 */}
                            {item.type === 'question'
                                ? <div className="me">{item.content}</div>
                                : item.type !== 'tool' && (
                                    <>
                                        {item.id && messageToolsMap[item.id] && messageToolsMap[item.id].length > 0 && (
                                            <div className="tools-status">
                                                {messageToolsMap[item.id].map((tool, toolIndex) => (
                                                    <div key={toolIndex} className="tool-item">
                                                        <div className="tool-header">
                                                            {tool.status === 'running'
                                                                ? <div className="spinner" aria-label="loading" />
                                                                : <IonIcon
                                                                    name='checkmark-circle-outline'
                                                                    style={{ color: 'var(--green)' }}
                                                                />
                                                            }
                                                            <span className="tool-name">{tool.title}</span>
                                                        </div>
                                                        {JSON.stringify(tool.input).length > 5 && (
                                                            <span className='tool-description' style={{ fontSize: '12px', opacity: .6, marginLeft: '25px' }}>
                                                                {JSON.stringify(tool.input)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <Spacer y={5} />
                                        {/* 답변 스켈레톤: 아직 내용이 비어 있고 스트리밍 진행 중일 때 */}
                                        {item.type === 'answer'
                                            && item.content === ''
                                            && isLoading
                                            && index === chat.length - 1 && (
                                                <div className="answer-skeleton">
                                                    <div className="skeleton-line" style={{ width: '80%' }} />
                                                    <div className="skeleton-line" style={{ width: '95%' }} />
                                                    <div className="skeleton-line" style={{ width: '90%' }} />
                                                    <div className="skeleton-line" style={{ width: '70%' }} />
                                                </div>
                                            )
                                        }
                                        {/* 실제 스트리밍 콘텐츠 */}
                                        {!(item.content === '' && isLoading && index === chat.length - 1) && (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    ol: ({ children }) => <>{children}</>,
                                                    ul: ({ children }) => <>{children}</>,
                                                    li: ({ children }) => <>{children}</>,
                                                }}
                                            >
                                                {item.content.replaceAll('\n', '\n\n')}
                                            </ReactMarkdown>
                                        )}
                                    </>
                                )
                            }
                        </div>
                    ))}
                </div>
            </main>

            <form onSubmit={handleSubmit} className='chat-input-container'>
                {chat.length === 0 && <>
                    <span style={{ fontSize: '12px', opacity: .4 }}>민감한 개인정보를 입력하지 말고, 답변을 재검토하세요.</span>
                    <span style={{ fontSize: '12px', opacity: .5, marginTop: '-5px' }}><a href="https://blog.yuntae.in/11cfc9b9-3eca-8078-96a0-c41c4ca9cb8f" target='_blank' style={{ color: 'inherit' }}>개인정보 처리방침</a></span>

                </>
                }
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={remainingQuestions > 0 ? "메시지를 입력하세요" : "일일 질문 한도를 모두 사용했습니다"}
                    disabled={isLoading || remainingQuestions <= 0}
                    className='chat-input'
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => [setChat([]), setInput('')]}
                            style={{ background: 'var(--card-background)', left: '20px' }}
                        >
                            <IonIcon name="add-outline" /> 새 채팅
                        </button>

                        <div className="question-limit-badge">
                            오늘 남은 질문 {remainingQuestions}개
                        </div>
                    </div>

                    {isLoading ? (
                        <button
                            type="button"
                            style={{ width: '30px', height: '30px', padding: 0, background: 'var(--card-background)' }}
                            onClick={handleStopResponse}
                        >
                            <IonIcon name="stop" />
                        </button>
                    ) : (
                        <button
                            style={{ width: '30px', height: '30px', padding: 0 }}
                            type="submit"
                            disabled={remainingQuestions <= 0}
                        >
                            <IonIcon name="send" />
                        </button>
                    )}
                </div>



            </form>

            <style jsx>{`
    .spinner {
        width:16px;
        height:16px;
        border:2px solid rgba(255,255,255,0.25);
        border-top-color: var(--primary, #4b8bff);
        border-radius:50%;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .answer-skeleton {
        display:flex;
        flex-direction:column;
        gap:10px;
        padding:8px 0 4px;
    }
    .skeleton-line {
        height:12px;
        border-radius:6px;
        background: linear-gradient(
            90deg,
            var(--skeleton-base) 0%,
            var(--skeleton-mid) 40%,
            var(--skeleton-highlight) 55%,
            var(--skeleton-base) 70%
        );
        background-size: 250% 100%;
        animation: shimmer 1.05s ease-in-out infinite;
    }
    @keyframes shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
    }
    .tools-status {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px;
        background: var(--card-background);
        border-radius: 12px;
        margin-top: 20px;
    }

    .tool-item {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
    }

    .tool-item.running::after {
        content:"";
        position:absolute;
        left:0; top:0; right:0; bottom:0;
        background:linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
        animation: tool-shimmer 1.2s infinite;
    }
    @keyframes tool-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    .tool-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        opacity: .8;
    }

    .question-limit-badge {
        display: flex;
        align-items: center;
        font-size: 13px;
        background: var(--card-background);
        padding: 7px 10px;
        border-radius: 20px;
        opacity: 0.8;
        color: ${remainingQuestions <= 1 ? '#ff6b6b' : 'inherit'};
        transition: color 0.3s ease;
    }
`}</style>
        </div >
    );
}
