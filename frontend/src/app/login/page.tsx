'use client';

import React from 'react';
import GlassLoginModal from '@/components/GlassLoginModal';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-forest-dark flex items-center justify-center p-4">
      <GlassLoginModal
        isOpen={true}
        onClose={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}
