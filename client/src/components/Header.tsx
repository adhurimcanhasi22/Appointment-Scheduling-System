import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './LoginModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, ChevronDown } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, user, isStaff, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary text-2xl font-heading font-bold">Bella Salon</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/services" className={`text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition duration-150 ${location === '/services' ? 'text-primary' : ''}`}>
              Services
            </Link>
            <Link href="/staff" className={`text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition duration-150 ${location === '/staff' ? 'text-primary' : ''}`}>
              Our Team
            </Link>
            <Link href="/gallery" className={`text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition duration-150 ${location === '/gallery' ? 'text-primary' : ''}`}>
              Gallery
            </Link>
            <Link href="/contact" className={`text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition duration-150 ${location === '/contact' ? 'text-primary' : ''}`}>
              Contact
            </Link>
            
            {!isAuthenticated ? (
              <Button 
                variant="outline" 
                className="text-primary border border-primary hover:bg-primary hover:text-white"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-neutral-600 hover:text-primary focus:outline-none px-3 py-2">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="h-8 w-8 rounded-full" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="font-medium text-sm">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Your Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments" className="cursor-pointer">Your Appointments</Link>
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem asChild>
                      <Link href="/staff-portal" className="cursor-pointer">Staff Portal</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-400 hover:text-primary hover:bg-neutral-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 pt-2 pb-3">
          <div className="px-2 space-y-1">
            <Link href="/services" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
              Services
            </Link>
            <Link href="/staff" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
              Our Team
            </Link>
            <Link href="/gallery" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
              Gallery
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
              Contact
            </Link>
            
            {!isAuthenticated ? (
              <Button 
                variant="link" 
                className="block w-full text-left px-3 py-2 text-base font-medium text-primary"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
            ) : (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
                  Your Profile
                </Link>
                <Link href="/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
                  Your Appointments
                </Link>
                {isStaff && (
                  <Link href="/staff-portal" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
                    Staff Portal
                  </Link>
                )}
                <Link href="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-100">
                  Settings
                </Link>
                <Button 
                  variant="link" 
                  className="block w-full text-left px-3 py-2 text-base font-medium text-primary"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
