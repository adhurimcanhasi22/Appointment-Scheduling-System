import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentSuccess() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect if someone navigates directly to this page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-100 py-16">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-neutral-800 mb-2">Appointment Confirmed!</h1>
            <p className="text-neutral-600">
              Your appointment has been successfully scheduled. We've sent a confirmation to your email.
            </p>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-500 mb-1">
              A summary of your appointment has been sent to your email. You can also view your appointments in your account.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full bg-primary hover:bg-primary-dark">
              <Link href="/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                View My Appointments
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Back to Home <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-neutral-500">
            <p>Need to make changes? You can manage your appointments from your account dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
