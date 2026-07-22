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
      id: params.get('sub'),
      email: params.get('email'),
      name: params.get('name'),
      role: role,
      package_id: params.get('package_id'),
      package_name: params.get('package_name'),
      effective_package_id: params.get('effective_package_id'),
      effective_package_name: params.get('effective_package_name'),
      plan_expiry_date: params.get('plan_expiry_date'),
      payment_status: params.get('payment_status')
    }));

    navigate(role === 'admin' ? '/templates' : '/search', { replace: true });
  }, [params, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Signing you in…</div>;
}