import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const firstLetter =
    user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    '?';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* User Icon */}
      <div
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold cursor-pointer shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {firstLetter}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-12 right-0 mt-2 w-48 bg-card text-card-foreground rounded-md shadow-lg z-50',
            'ring-1 ring-border ring-opacity-5'
          )}
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="font-semibold">{user?.user_metadata?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* View Profile */}
          <Button
            variant="ghost"
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            onClick={() => {
              setIsOpen(false);
              // ✅ Modified navigation to pass user in state
              navigate("/profile", { state: { user } });
            }}
          >
            View Profile
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full text-left px-4 py-2 text-sm hover:bg-muted"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
