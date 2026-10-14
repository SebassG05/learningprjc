import AuthModal from '../components/auth/LazyAuthModal';
import React, { useState } from 'react';

const LoginPage = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen">
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default LoginPage;
