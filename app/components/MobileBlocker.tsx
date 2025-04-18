'use client';

import React, { useEffect, useState } from 'react';

export default function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 788);
    };
    
    // Check on initial render
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isClient) {
    // Return null or a loading indicator for initial server-side render
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen p-6 bg-[var(--background)] text-[var(--primary-black)]">
        <div className="bg-[var(--foreground)] p-8 rounded-[12px] shadow-[0_0_14px_0_rgba(108,103,97,0.06)] max-w-md text-center">
          <h1 className="text-2xl font-primary font-semibold mb-4">Mobile Version Coming Soon</h1>
          <p className="font-primary mb-2">
            Thank you for your interest in In His Path.
          </p>
          <p className="font-primary mb-4">
            Our website is currently only available on desktop devices (screens larger than 788px).
          </p>
          <p className="font-primary text-sm text-[var(--primary-gray)]">
            Please visit us on a larger screen to explore the full experience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 