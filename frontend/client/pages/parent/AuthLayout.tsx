import React from 'react';
import '../ParentPortalPrototype.css';
import { Brand, LockerIllustration } from '../../components/ParentBrand';

export default function AuthLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: React.ReactNode; children: React.ReactNode }) {
    return <div className="pp-root">
        <main className="pp-auth">
            <section className="pp-auth-form">
                <Brand />
                <div className="pp-auth-content">
                    <span className="pp-eyebrow">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{intro}</p>
                    {children}
                </div>
                <footer>Ein Angebot deines Fördervereins</footer>
            </section>
            <section className="pp-auth-art"><span className="pp-art-badge">Weniger tragen. Mehr Freiraum.</span><LockerIllustration /><h2>Ein kleines Fach.<br />Ein leichterer Schultag.</h2><p>Ein sicherer Platz für Bücher, Sportsachen<br />und alles, was morgen wieder gebraucht wird.</p></section>
        </main>
    </div>;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? <span id={id} className="pp-field-error" role="alert">{message}</span> : null;
}
