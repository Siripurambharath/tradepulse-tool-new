import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SsoCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');

    if (!token) {
      navigate('/login?error=sso_failed', { replace: true });
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role || 'seller');
    localStorage.setItem('seller', JSON.stringify({
      id: params.get('id'),
      email: params.get('email'),
      name: params.get('name'),
      role,
    }));

    navigate(role === 'admin' ? '/templates' : '/search', { replace: true });
  }, [params, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Signing you in…</div>;
}