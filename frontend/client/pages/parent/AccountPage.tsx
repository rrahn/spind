import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allauth, AllauthUser } from '../../api/allauth';
import AuthLayout from './AuthLayout';

export default function AccountPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<AllauthUser>();

    useEffect(() => {
        allauth.session().then(response => {
            if (response.status === 200 && response.data?.user) setUser(response.data.user);
            else navigate('/registrieren', { replace: true });
        });
    }, [navigate]);

    if (!user) return null;
    return <AuthLayout eyebrow="DEIN KONTO" title={`Willkommen, ${user.display}.`} intro="Dein Konto ist eingerichtet und deine E-Mail-Adresse bestätigt.">
        <p className="pp-notice" role="status">Als Nächstes kannst du hier deine Kinder anlegen und ein Schließfach buchen.</p>
    </AuthLayout>;
}
