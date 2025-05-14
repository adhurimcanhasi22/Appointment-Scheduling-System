import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";

// Pages
import Home from "@/pages/Home";
import BookAppointment from "@/pages/BookAppointment";
import AppointmentSuccess from "@/pages/AppointmentSuccess";
import StaffPortal from "@/pages/StaffPortal";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Services from "@/pages/Services";
import Staff from "@/pages/Staff";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import UserAppointments from "@/pages/UserAppointments";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/book" component={BookAppointment} />
        <Route path="/booking-success" component={AppointmentSuccess} />
        <Route path="/staff-portal" component={StaffPortal} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/services" component={Services} />
        <Route path="/staff" component={Staff} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/contact" component={Contact} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/appointments" component={UserAppointments} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
