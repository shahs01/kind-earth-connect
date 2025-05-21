
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import Profile from "@/pages/Profile";
import Community from "@/pages/Community";
import SearchHelp from "@/pages/SearchHelp";
import RequestHelp from "@/pages/RequestHelp";
import OfferHelp from "@/pages/OfferHelp";
import NonprofitDirectory from "@/pages/NonprofitDirectory";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import Messages from "@/pages/Messages";
import Favorites from "@/pages/Favorites";
import Notifications from "@/pages/Notifications";
import FAQ from "@/pages/FAQ";
import Donate from "@/pages/Donate";
import Volunteer from "@/pages/Volunteer";
import SponsorProject from "@/pages/SponsorProject";
import PartnerWithUs from "@/pages/PartnerWithUs";
import DonateGoods from "@/pages/DonateGoods";
import Contact from "@/pages/Contact";
import Subscribe from "@/pages/Subscribe";
import MonthlyGiving from "@/pages/MonthlyGiving";
import Values from "@/pages/Values";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="thryvance-theme">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/about" element={<About />} />
          <Route path="/values" element={<Values />} />
          <Route path="/community" element={<Community />} />
          <Route path="/nonprofit-directory" element={<NonprofitDirectory />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/sponsor-project" element={<SponsorProject />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/donate-goods" element={<DonateGoods />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/monthly-giving" element={<MonthlyGiving />} />
          <Route path="/search-help" element={<SearchHelp />} />
          
          {/* Routes that require just authentication */}
          <Route element={<ProtectedRoute requireVerified={false} />}>
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          
          {/* Routes that require authentication and email verification */}
          <Route element={<ProtectedRoute requireVerified={true} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/offer-help" element={<OfferHelp />} />
            <Route path="/messages" element={<Messages />}>
              <Route path=":userId" element={null} />
            </Route>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
