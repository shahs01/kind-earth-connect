
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import SearchHelp from "./pages/SearchHelp";
import OfferHelp from "./pages/OfferHelp";
import RequestHelp from "./pages/RequestHelp";
import Community from "./pages/Community";
import NonprofitDirectory from "./pages/NonprofitDirectory";
import Volunteer from "./pages/Volunteer";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import CreatePosting from "./pages/CreatePosting";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SafetyTips from "./pages/SafetyTips";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EditPosting from "./pages/EditPosting";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import Values from "./pages/Values";
import OurImpact from "./pages/OurImpact";
import Careers from "./pages/Careers";
import PartnerWithUs from "./pages/PartnerWithUs";
import Donate from "./pages/Donate";
import MonthlyGiving from "./pages/MonthlyGiving";
import SponsorProject from "./pages/SponsorProject";
import DonateGoods from "./pages/DonateGoods";
import ListNonprofit from "./pages/ListNonprofit";
import Subscribe from "./pages/Subscribe";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";

console.log('App.tsx: App component loaded');

function App() {
  console.log('App.tsx: App component rendering');
  
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/search-help" element={<SearchHelp />} />
            <Route path="/offer-help" element={<OfferHelp />} />
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/community" element={<Community />} />
            <Route path="/nonprofits" element={<NonprofitDirectory />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/create-posting" element={<CreatePosting />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/values" element={<Values />} />
            <Route path="/our-impact" element={<OurImpact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/monthly-giving" element={<MonthlyGiving />} />
            <Route path="/sponsor-project" element={<SponsorProject />} />
            <Route path="/donate-goods" element={<DonateGoods />} />
            <Route path="/list-nonprofit" element={<ListNonprofit />} />
            <Route path="/subscribe" element={<Subscribe />} />
            
            {/* Protected Routes - temporarily disabled to debug */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/edit-posting/:id" element={<EditPosting />} />
            
            {/* Admin Routes - temporarily disabled to debug */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
