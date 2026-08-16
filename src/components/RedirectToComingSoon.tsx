import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectToComingSoon() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/coming-soon', { replace: true });
  }, [navigate]);

  return null;
}
