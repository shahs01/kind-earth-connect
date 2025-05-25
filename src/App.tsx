import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Index from "./pages/Index";
import About from "./pages/About";
import Values from "./pages/Values";
import Community from "./pages/Community";
import Volunteer from "./pages/Volunteer";
import SafetyTips from "./pages/SafetyTips";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import OfferHelp from "./pages/OfferHelp";
import RequestHelp from "./pages/RequestHelp";
import NonprofitDirectory from "./pages/NonprofitDirectory";
import ListNonprofit from "./pages/ListNonprofit";
import Profile from "./pages/Profile";
import Donate from "./pages/Donate";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Subscribe from "./pages/Subscribe";
import PartnerWithUs from "./pages/PartnerWithUs";
import SponsorProject from "./pages/SponsorProject";
import MonthlyGiving from "./pages/MonthlyGiving";
import DonateGoods from "./pages/DonateGoods";
import Careers from "./pages/Careers";
import CreatePosting from "./pages/CreatePosting";
import EditPosting from "./pages/EditPosting";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import "./App.css";
import { Toaster } from "@/components/ui/toaster";

// ProfileRedirect component to handle /profile path
const ProfileRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Navigate to={`/profile/${user.id}`} replace />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/values" element={<Values />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Updated auth callback route to handle both variations */}
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/community" element={<Community />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/offer-help" element={<OfferHelp />} />
        <Route path="/request-help" element={<RequestHelp />} />
        <Route path="/nonprofit-directory" element={<NonprofitDirectory />} />
        <Route path="/list-nonprofit" element={<ListNonprofit />} />
        {/* Redirect from search-help to community page */}
        <Route path="/search-help" element={<Navigate to="/community" replace />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/partner-with-us" element={<PartnerWithUs />} />
        <Route path="/sponsor-project" element={<SponsorProject />} />
        <Route path="/monthly-giving" element={<MonthlyGiving />} />
        <Route path="/donate-goods" element={<DonateGoods />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/create-posting" element={<CreatePosting />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* Add a simple redirect from /profile to the user's profile */}
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/edit-post/:postId" element={<EditPosting />} />
        </Route>
        
        {/* Admin protected routes */}
        <Route path="/admin/*" element={<AdminProtectedRoute />}>
          <Route path="dashboard/*" element={<AdminDashboard />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
