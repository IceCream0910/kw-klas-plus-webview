import type { NextApiRequest, NextApiResponse } from 'next'

const SESSION_COOKIE_NAME = 'chatkit_session_id'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    let sessionCookie: string | null = null

    try {
        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
            return
        }

        // Get or create user session
        const { userId, sessionCookie: resolvedSessionCookie } = await resolveUserId(req)
        sessionCookie = resolvedSessionCookie

        const workflowId = process.env.CHATKIT_WORKFLOW_ID

        if (!workflowId) {
            sendResponse(res, 400, { error: 'Missing workflow id' }, sessionCookie)
            return
        }

        // Create session with OpenAI ChatKit API
        const upstreamResponse = await fetch('https://api.openai.com/v1/chatkit/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
                'OpenAI-Beta': 'chatkit_beta=v1',
            },
            body: JSON.stringify({
                workflow: { id: workflowId },
                user: userId,
                chatkit_configuration: {
                    file_upload: { enabled: false },
                },
            }),
        })

        const upstreamJson = await upstreamResponse.json().catch(() => ({}))

        if (!upstreamResponse.ok) {
            console.error('ChatKit session creation failed', {
                status: upstreamResponse.status,
                body: upstreamJson,
            })
            sendResponse(
                res,
                upstreamResponse.status,
                { error: 'Failed to create session' },
                sessionCookie
            )
            return
        }

        sendResponse(
            res,
            200,
            {
                client_secret: upstreamJson?.client_secret ?? null,
                expires_after: upstreamJson?.expires_after ?? null,
            },
            sessionCookie
        )
    } catch (error) {
        console.error('Create session error', error)
        sendResponse(res, 500, { error: 'Unexpected error' }, sessionCookie)
    }
}

async function resolveUserId(req: NextApiRequest): Promise<{
    userId: string
    sessionCookie: string | null
}> {
    const existing = getCookieValue(req.headers.cookie || null, SESSION_COOKIE_NAME)

    if (existing) {
        return { userId: existing, sessionCookie: null }
    }

    const generated = crypto.randomUUID()

    return {
        userId: generated,
        sessionCookie: serializeSessionCookie(generated),
    }
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';')
    for (const cookie of cookies) {
        const [rawName, ...rest] = cookie.split('=')
        if (rawName?.trim() === name) {
            return rest.join('=').trim()
        }
    }
    return null
}

function serializeSessionCookie(value: string): string {
    const attributes = [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
        'Path=/',
        `Max-Age=${SESSION_COOKIE_MAX_AGE}`,
        'HttpOnly',
        'SameSite=Lax',
    ]

    if (process.env.NODE_ENV === 'production') {
        attributes.push('Secure')
    }

    return attributes.join('; ')
}

function sendResponse(
    res: NextApiResponse,
    status: number,
    payload: unknown,
    sessionCookie: string | null
) {
    if (sessionCookie) {
        res.setHeader('Set-Cookie', sessionCookie)
    }
    res.status(status).json(payload)
}