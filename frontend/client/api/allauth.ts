// Thin client for django-allauth's headless "browser" API, reached same-origin via the Express proxy.
// Auth state lives in an HttpOnly session cookie; nothing sensitive is stored in JS-accessible storage.

const BASE = '/_allauth/browser/v1';

export type AllauthError = { message: string; code: string; param?: string };
export type AllauthUser = { id: string; display: string; email?: string };
export type AllauthResponse = {
    status: number;
    errors?: AllauthError[];
    data?: { user?: AllauthUser; flows?: { id: string; is_pending?: boolean }[] };
    meta?: { is_authenticated?: boolean };
};

function csrfToken(): string | undefined {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

async function request(method: string, path: string, body?: unknown): Promise<AllauthResponse> {
    if (method !== 'GET' && !csrfToken()) {
        await fetch(`${BASE}/config`, { credentials: 'same-origin' });
    }
    const response = await fetch(BASE + path, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(method !== 'GET' ? { 'X-CSRFToken': csrfToken() ?? '' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    try {
        return await response.json();
    } catch {
        return { status: response.status, errors: [{ message: 'Der Server ist gerade nicht erreichbar.', code: 'unavailable' }] };
    }
}

export function isPending(response: AllauthResponse, flow: string): boolean {
    return Boolean(response.data?.flows?.some(f => f.id === flow && f.is_pending));
}

export type SignupInput = { email: string; password: string; first_name: string; last_name: string };

export const allauth = {
    signup: (input: SignupInput) => request('POST', '/auth/signup', input),
    verifyEmail: (key: string) => request('POST', '/auth/email/verify', { key }),
    resendVerification: () => request('POST', '/auth/email/verify/resend'),
    session: () => request('GET', '/auth/session'),
};
