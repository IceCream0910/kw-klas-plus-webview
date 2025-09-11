
/**
 * KLAS 내부 API를 호출하는 함수
 * 
 * @param url - 요청을 보낼 KLAS 엔드포인트 URL
 * @param token - KLAS 인증을 위한 유저의 세션 토큰
 * @param body - 요청 본문 페이로드 (생략 가능)
 * @returns JSON 응답을 담은 Promise
 *
 * @example
 * ```ts
 * const response = await KLAS('https://klas.kw.ac.kr/endpoint', 'user의 sessionToken', { yearHakgi: '2025,1' });
 * ```
 */
export function KLAS(url: string, token: string, body: any): Promise<any> {
    if (!token || !url) {
        return Promise.reject(new Error('Missing required values'));
    }

    return fetch('/api/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url,
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                Cookie: `SESSION=${token};`,
            },
            body,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error('Error fetching KLAS data:', error);
            throw error;
        });
}