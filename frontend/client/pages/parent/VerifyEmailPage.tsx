import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { allauth, isPending } from '../../api/allauth';
import AuthLayout, { FieldError } from './AuthLayout';

type Stage = 'checking' | 'pending' | 'expired';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const email = (useLocation().state as { email?: string } | null)?.email;
    const [stage, setStage] = useState<Stage>('checking');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        allauth.session().then(response => {
            if (response.status === 200) navigate('/konto', { replace: true });
            else setStage(isPending(response, 'verify_email') ? 'pending' : 'expired');
        });
    }, [navigate]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setSubmitting(true);
        setError(undefined);
        setNotice(undefined);
        const response = await allauth.verifyEmail(code.trim().toUpperCase());
        setSubmitting(false);
        if (response.status === 200) navigate('/konto', { replace: true });
        else if (response.status === 409) setStage('expired');
        else setError(response.errors?.[0]?.message ?? 'Der Code ist ungültig oder abgelaufen.');
    }

    async function resend() {
        setError(undefined);
        const response = await allauth.resendVerification();
        if (response.status === 200) setNotice('Wir haben dir einen neuen Code geschickt.');
        else if (response.status === 429) setError('Bitte warte einen Moment, bevor du einen neuen Code anforderst.');
        else setStage('expired');
    }

    if (stage === 'expired') {
        return <AuthLayout eyebrow="E-MAIL BESTÄTIGEN" title="Bitte starte neu." intro="Die Bestätigung ist in diesem Browser nicht mehr aktiv. Codes gelten nur im Browserfenster, in dem du dich registriert hast.">
            <Link className="pp-primary" to="/registrieren">Zur Registrierung <span aria-hidden="true">→</span></Link>
        </AuthLayout>;
    }

    return <AuthLayout eyebrow="E-MAIL BESTÄTIGEN" title="Fast geschafft." intro={<>Wir haben einen Bestätigungscode an {email ? <strong>{email}</strong> : 'deine E-Mail-Adresse'} geschickt. Gib ihn hier ein.</>}>
        <form onSubmit={submit}>
            <label>Bestätigungscode
                <input name="code" autoComplete="one-time-code" inputMode="text" autoCapitalize="characters" spellCheck={false} required maxLength={9} placeholder="XXXX-XXXX" value={code} onChange={event => setCode(event.target.value)} disabled={stage !== 'pending'} aria-invalid={!!error} aria-describedby={error ? 'code-error' : undefined} />
            </label>
            <FieldError id="code-error" message={error} />
            <button className="pp-primary" type="submit" disabled={submitting || stage !== 'pending'}>{submitting ? 'Wird geprüft …' : 'E-Mail bestätigen'} <span aria-hidden="true">→</span></button>
            <button type="button" className="pp-text" onClick={resend} disabled={stage !== 'pending'}>Keinen Code erhalten? Neuen Code senden</button>
            {notice && <p role="status" className="pp-notice">{notice}</p>}
        </form>
    </AuthLayout>;
}
