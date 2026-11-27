import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allauth, isPending, SignupInput } from '../../api/allauth';
import AuthLayout, { FieldError } from './AuthLayout';

const MIN_PASSWORD_LENGTH = 15;
const empty: SignupInput = { first_name: '', last_name: '', email: '', password: '' };

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState<SignupInput>(empty);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const update = (field: keyof SignupInput) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: event.target.value });
    const described = (field: string) => (errors[field] ? `${field}-error` : undefined);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        const response = await allauth.signup({ ...form, email: form.email.trim() });
        setSubmitting(false);
        if (isPending(response, 'verify_email')) {
            navigate('/registrieren/bestaetigen', { state: { email: form.email.trim() } });
        } else if (response.status === 200) {
            navigate('/konto', { replace: true });
        } else {
            const next: Record<string, string> = {};
            response.errors?.forEach(error => { next[error.param ?? 'form'] ??= error.message; });
            if (response.status === 429) next.form = 'Zu viele Versuche. Bitte warte einen Moment.';
            setErrors(Object.keys(next).length ? next : { form: 'Die Registrierung ist fehlgeschlagen. Bitte versuche es erneut.' });
        }
    }

    return <AuthLayout eyebrow="WILLKOMMEN IM ELTERNPORTAL" title="Ein guter Anfang." intro={<>Kinder verwalten. Schließfächer buchen.<br />Alles an einem Ort, für jedes Schuljahr.</>}>
        <form onSubmit={submit}>
            <label>Vorname<input name="first_name" autoComplete="given-name" required maxLength={150} value={form.first_name} onChange={update('first_name')} aria-invalid={!!errors.first_name} aria-describedby={described('first_name')} /></label>
            <FieldError id="first_name-error" message={errors.first_name} />
            <label>Nachname<input name="last_name" autoComplete="family-name" required maxLength={150} value={form.last_name} onChange={update('last_name')} aria-invalid={!!errors.last_name} aria-describedby={described('last_name')} /></label>
            <FieldError id="last_name-error" message={errors.last_name} />
            <label>E-Mail-Adresse<input name="email" type="email" autoComplete="email" required placeholder="name@beispiel.de" value={form.email} onChange={update('email')} aria-invalid={!!errors.email} aria-describedby={described('email')} /></label>
            <FieldError id="email-error" message={errors.email} />
            <label className="pp-password-label" htmlFor="registration-password">Passwort</label>
            <div className="pp-password-field">
                <input id="registration-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} value={form.password} onChange={update('password')} aria-invalid={!!errors.password} aria-describedby={`password-hint${errors.password ? ' password-error' : ''}`} />
                <button type="button" className="pp-password-toggle" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'} title={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {showPassword
                            ? <path d="M3 10c2.3 2.7 5.3 4 9 4s6.7-1.3 9-4M5 12l-1.5 2M9 13.5l-.5 2.5M15 13.5l.5 2.5M19 12l1.5 2" />
                            : <><path d="M2.5 12C4.8 8.2 8 6 12 6s7.2 2.2 9.5 6c-2.3 3.8-5.5 6-9.5 6s-7.2-2.2-9.5-6Z" /><circle cx="12" cy="12" r="2.7" /></>}
                    </svg>
                </button>
            </div>
            <p id="password-hint" className="pp-form-note">Mindestens {MIN_PASSWORD_LENGTH} Zeichen. Ein Satz aus mehreren Wörtern ist leicht zu merken und sicher. Ein Passwort-Manager hilft.</p>
            <FieldError id="password-error" message={errors.password} />
            <p className="pp-form-note">Wir speichern deinen Namen und deine E-Mail-Adresse, um dein Konto zu führen. Du bestätigst deine E-Mail-Adresse im nächsten Schritt mit einem Code.</p>
            <button className="pp-primary" type="submit" disabled={submitting}>{submitting ? 'Wird gesendet …' : 'Konto erstellen'} <span aria-hidden="true">→</span></button>
            {errors.form && <p role="alert" className="pp-notice pp-notice-error">{errors.form}</p>}
        </form>
    </AuthLayout>;
}
