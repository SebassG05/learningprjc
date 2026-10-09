import AuthModal from '../components/auth/AuthModal';
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
