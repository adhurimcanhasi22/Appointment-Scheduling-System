import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import StaffDashboard from '@/components/StaffDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, X, User, Calendar, Users, CreditCard, Settings } from 'lucide-react';

export default function StaffPortal() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isStaff } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Redirect if not authenticated or not staff
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isStaff) {
      navigate('/');
    }
  }, [isAuthenticated, isStaff, navigate]);
  
  // If not authenticated or not staff, don't render anything
  if (!isAuthenticated || !isStaff) {
    return null;
  }
  
  return (
    <div className="bg-white min-h-screen">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 transition duration-200 ease-in-out md:w-64 bg-neutral-800 text-white`}>
          <div className="p-4">
            <h2 className="text-2xl font-heading font-bold text-white">Staff Portal</h2>
          </div>
          
          <nav className="mt-6">
            <Button variant="default" className="w-full justify-start px-4 py-6 bg-primary text-white hover:bg-primary-dark transition duration-150">
              <Calendar className="h-5 w-5 mr-3" />
              <span>Appointments</span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start px-4 py-6 text-neutral-300 hover:bg-neutral-700 transition duration-150">
              <Users className="h-5 w-5 mr-3" />
              <span>Clients</span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start px-4 py-6 text-neutral-300 hover:bg-neutral-700 transition duration-150">
              <CreditCard className="h-5 w-5 mr-3" />
              <span>Services</span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start px-4 py-6 text-neutral-300 hover:bg-neutral-700 transition duration-150">
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </Button>
          </nav>
          
          <div className="absolute bottom-0 p-4 w-64">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium mr-3">
                {user?.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-neutral-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-x-hidden">
          {/* Dashboard Header */}
          <div className="p-4 md:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-neutral-600 hover:text-primary"
                >
                  {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              
              <h2 className="text-2xl font-heading font-bold text-neutral-800 hidden md:block">Staff Dashboard</h2>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost"
                  className="relative p-2 text-neutral-600 hover:text-primary"
                >
                  <div className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-primary text-white text-xs rounded-full">3</div>
                  <Calendar className="h-6 w-6" />
                </Button>
                
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="h-6 w-6 text-neutral-600" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Overlay when sidebar is open on mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          
          {/* Dashboard Content */}
          <div className="flex-1">
            <StaffDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
