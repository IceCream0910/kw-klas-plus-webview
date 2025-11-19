import type { StartScreenPrompt } from "@openai/chatkit-react"

export const CHATKIT_API_URL = "/api/chatkit"
export const CHATKIT_DOMAIN_KEY = process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY ?? "domain_pk_localhost_dev"

export const STARTER_PROMPTS: StartScreenPrompt[] = [
    {
        label: "이번 학기 기말고사 언제야?",
        prompt: "이번 학기 기말고사 언제야?",
        icon: "calendar",
    },
    {
        label: "최근 공모전 정보 찾아줘",
        prompt: "최근 공모전 정보 찾아줘",
        icon: "document",
    },
    {
        label: "학생증 발급 방법 알려줘",
        prompt: "학생증 발급 방법 알려줘",
        icon: "info",
    },
    {
        label: "최근에 올라온 강의 공지사항 요약해줘",
        prompt: "최근에 올라온 강의 공지사항 요약해줘",
        icon: "book-open",
    },
    {
        label: "오늘 학식 메뉴 뭐야",
        prompt: "오늘 학식 메뉴 뭐야",
        icon: "search",
    }
]