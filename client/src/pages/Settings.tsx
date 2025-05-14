import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { BellRing, Mail, Phone, Shield, Trash2, LogOut } from 'lucide-react';

export default function Settings() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle save settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    }, 1500);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // Simulate API call
    setTimeout(() => {
      logout();
      navigate('/');
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
    }, 1500);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-heading text-neutral-800">Account Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your account preferences and settings</p>
      </div>

      {/* Notifications Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="h-5 w-5 mr-2 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-neutral-500">Receive important updates via email</p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications" className="text-base">SMS Notifications</Label>
              <p className="text-sm text-neutral-500">Receive text messages for updates</p>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={smsNotifications} 
              onCheckedChange={setSmsNotifications} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointment-reminders" className="text-base">Appointment Reminders</Label>
              <p className="text-sm text-neutral-500">Get reminders before your scheduled appointments</p>
            </div>
            <Switch 
              id="appointment-reminders" 
              checked={appointmentReminders} 
              onCheckedChange={setAppointmentReminders} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails" className="text-base">Marketing Emails</Label>
              <p className="text-sm text-neutral-500">Receive promotions and special offers</p>
            </div>
            <Switch 
              id="marketing-emails" 
              checked={marketingEmails} 
              onCheckedChange={setMarketingEmails} 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Communication Preferences Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            Communication Preferences
          </CardTitle>
          <CardDescription>
            Manage your preferred contact methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-neutral-500">Primary email</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Change
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.phone || 'Add phone number'}</p>
              <p className="text-sm text-neutral-500">Mobile phone</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              {user?.phone ? 'Change' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Security Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor-auth" className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
            </div>
            <Switch 
              id="two-factor-auth" 
              checked={twoFactorAuth} 
              onCheckedChange={setTwoFactorAuth} 
            />
          </div>
          
          <Separator />
          
          <div>
            <Button variant="outline" className="w-full md:w-auto" onClick={() => navigate('/profile')}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>
            These actions are irreversible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-medium">Log Out from All Devices</h3>
              <p className="text-sm text-neutral-500">This will log you out of all sessions except the current one</p>
            </div>
            <Button variant="outline" className="text-amber-500 border-amber-500">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out All Sessions
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-medium text-red-500">Delete Account</h3>
              <p className="text-sm text-neutral-500">Permanently delete your account and all associated data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary-dark text-white"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}