import { useState, useEffect, useRef, use } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import IonIcon from '@reacticons/ionicons';
import LoadingComponent from './components/loader';
import Spacer from './components/spacer';
import remarkGfm from 'remark-gfm'

export default function Home() {
    const [subjList, setSubjList] = useState(null);
    const [input, setInput] = useState('');
    const [token, setToken] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTools, setActiveTools] = useState([]);
    const scrollRef = useRef(null);
    const abortControllerRef = useRef(null);
    const [randomSubjName, setRandomSubjName] = useState(null);
    const [yearHakgi, setYearHakgi] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
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
            Android.completePageLoad();
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

            setChat(prev => [...prev, { type: 'answer', content: '' }]);
            setActiveTools([]);

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
                                        status: 'running',
                                    }
                                ]);
                                break;

                            case 'tool_end':
                                setActiveTools(tools => tools.map(tool =>
                                    tool.name === data.tool
                                        ? { ...tool, status: 'completed' }
                                        : tool
                                ));
                                break;

                            case 'complete':
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
    }, [chat]);

    return (
        <div>
            <Head>
                <title>KLAS GPT</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <div className='messages-container' ref={scrollRef}>
                    {chat.length === 0 && (
                        <>
                            <div>
                                <Spacer y={50} />
                                <h2>궁금한 것을 물어보세요!</h2>
                                <span style={{ opacity: .7 }}>KLAS와 학교 홈페이지에 있는 정보를 기반으로 답변해줄게요.</span>
                                <Spacer y={20} />
                                {randomSubjName && (
                                    <>
                                        <button onClick={() => setInput(`${randomSubjName} 출석 현황 알려줘`)} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="checkmark-outline" /></span>
                                            <span style={{ width: 'calc(100% - 60px)' }}>{randomSubjName} 출석 현황 알려줘</span>
                                        </button>
                                        <button onClick={() => setInput(`${randomSubjName} 강의 공지사항 알려줘`)} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="notifications-outline" /></span>
                                            <span style={{ width: 'calc(100% - 60px)' }}>{randomSubjName} 최근 공지사항 보여줘</span>
                                        </button>
                                        <button onClick={() => setInput(`${randomSubjName} 미제출 과제 있어?`)} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="documents-outline" /></span>
                                            <span style={{ width: 'calc(100% - 60px)' }}>{randomSubjName} 미제출 과제 있어?</span>
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setInput('최근 학교 공지사항 알려줘')} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="list-outline" /></span>
                                    <span style={{ width: 'calc(100% - 60px)' }}>최근 학교 공지사항 알려줘</span>
                                </button>
                                <button onClick={() => setInput('오늘의 학식 메뉴')} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="fast-food-outline" /></span>
                                    <span style={{ width: 'calc(100% - 60px)' }}>오늘 학식 메뉴 알려줘</span>
                                </button>
                                <button onClick={() => setInput(`${new Date().getMonth() + 1}월 학사일정`)} style={{ background: 'var(--card-background)', marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ width: '30px', height: '30px', background: 'var(--background)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}><IonIcon name="calendar-outline" /></span>
                                    <span style={{ width: 'calc(100% - 60px)' }}>이번 달 학사일정 알려줘</span>
                                </button>
                                <br />
                            </div>
                        </>
                    )}
                    {chat.map((item, index) => (
                        <div key={index} className={`message`}>
                            {item.type === 'question' && <IonIcon name="person-circle" style={{ fontSize: '30px' }} />}
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ol: ({ children }) => <>{children}</>,
                                    ul: ({ children }) => <>{children}</>,
                                    li: ({ children }) => <>{children}</>,
                                }}
                            >
                                {item.content}
                            </ReactMarkdown>
                            {index === chat.length - 1 && isLoading && activeTools.length <= 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <LoadingComponent />
                                </div>
                            )}
                            {index === chat.length - 1 && isLoading && activeTools.length > 0 && (
                                <div className="tools-status">
                                    <LoadingComponent />
                                    {activeTools.map((tool, index) => (
                                        <div key={index} className="tool-item">
                                            <div className="tool-header">
                                                <IonIcon
                                                    name={tool.status === 'running' ? 'hourglass' : 'checkmark-circle-outline'}
                                                    style={{ color: tool.status === 'running' ? 'inherit' : 'var(--green)' }}
                                                />
                                                <span className="tool-name">{tool.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <form onSubmit={handleSubmit} className='chat-input-container'>
                {!isInputFocused && (
                    <button type="button" disabled={isLoading} onClick={() => [setChat([]), setInput('')]} style={{ background: 'var(--background)', left: '20px' }}>
                        <IonIcon name="refresh" />
                    </button>
                )}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    disabled={isLoading}
                    className='chat-input'
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    style={{ paddingLeft: isInputFocused ? '20px' : '50px' }}
                />
                {isLoading ? (
                    <button type="button" onClick={handleStopResponse}>
                        <IonIcon name="stop" />
                    </button>
                ) : (
                    <button type="submit">
                        <IonIcon name="send" />
                    </button>
                )}
                <span style={{ fontSize: '12px', opacity: .4 }}>AI는 틀린 답변을 제공할 수 있습니다. <span style={{ fontSize: '12px', opacity: .5, marginTop: '5px' }}><a href="https://blog.yuntae.in/11cfc9b9-3eca-8078-96a0-c41c4ca9cb8f" target='_blank' style={{ color: 'inherit' }}>개인정보 처리방침</a></span>
                </span>
            </form>

            <style jsx>{`
    .tools-status {
        padding: 10px;
        background: var(--card-background);
        border-radius: 12px;
        margin-top: 20px;
    }

    .tool-item {
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }

    .tool-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        opacity: .8;
    }
`}</style>
        </div >
    );
}
