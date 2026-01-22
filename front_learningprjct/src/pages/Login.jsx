import AuthModal from '../components/auth/AuthModal';
import React, { useState } from 'react';

const LoginPage = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: '100vh', background: '#23272f' }}>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default LoginPage;
