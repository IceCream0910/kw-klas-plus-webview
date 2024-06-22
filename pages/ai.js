import { useState, useEffect, useRef, use } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import IonIcon from '@reacticons/ionicons';
import LoadingComponent from './components/loader';

export default function Home() {
    const subjList = useRef(null);
    const [input, setInput] = useState('');
    const [token, setToken] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const newQuestion = { type: 'question', content: input.trim() };
            setChat(prevChat => [...prevChat, newQuestion]);
            setInput('');
            setIsLoading(true);
            await sendMessage([...chat, newQuestion]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };
        window.receiveSubjList = function (receivedSubjList) {
            if (!receivedSubjList) return;
            subjList.current = receivedSubjList;
            console.log(subjList.current);
        };

        //Android.completePageLoad();
    }, [])


    const sendMessage = async (conversation) => {
        try {
            const response = await fetch("https://klas-gpt-api.taein.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation, subjList: subjList.current, token }),
            });
            const data = await response.json();
            setChat(prevChat => [...prevChat, { type: 'answer', content: data.message }]);
        } catch (error) {
            console.error("Error fetching response:", error);
            setChat(prevChat => [...prevChat, { type: 'answer', content: "KLAS에서 정보를 가져오는 데 실패했어요. 정확한 과목명과 원하는 항목을 말해보세요." }]);
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
                <title>KLAS Bot</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <div className='messages-container' ref={scrollRef}>
                    {chat.length === 0 && (
                        <>
                            <div className='profile-card'>
                                <h3>궁금한 것을 물어보세요!</h3>
                                <span>AI가 KLAS에서 정보를 불러와 답변해줍니다. Beta 기능이므로 작동이 불안정할 수 있습니다.</span>
                                <br />
                                <h4>이렇게 말해보세요</h4>
                                <ul>
                                    <li>[과목명] 출석 현황 알려줘</li>
                                    <li>[과목명] 공지사항 요약해줘</li>
                                    <li>[과목명] 과제 몇 개 남았어?</li>
                                </ul>
                                <span style={{ fontSize: '14px', opacity: .5, marginTop: '5px' }}>* KLAS에 있는 학사 정보를 제 3자(OpenAI)에게 전송하는 것에 동의하는 것으로 간주합니다.</span>
                            </div>
                        </>
                    )}
                    {chat.map((item, index) => (
                        <div key={index} className={`message`}>
                            {item.type === 'question' && <IonIcon name="person-circle" style={{ fontSize: '30px' }} />}
                            <div style={{ maxWidth: item.type === 'question' ? '80%' : '100%' }}>
                                <ReactMarkdown>{item.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <LoadingComponent />
                    )}
                </div>
            </main>

            <form onSubmit={handleSubmit} className='chat-input-container'>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    disabled={isLoading}
                    className='chat-input'
                />
                <button type="submit">
                    <IonIcon name="send" />
                </button>
                <span style={{ fontSize: '12px', opacity: .5 }}>AI가 생성한 답변은 정확하지 않을 수 있습니다.</span>
            </form>
        </div>
    );
}