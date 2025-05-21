
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
import Profile from "@/pages/Profile";
import Community from "@/pages/Community";
import SearchHelp from "@/pages/SearchHelp";
import RequestHelp from "@/pages/RequestHelp";
import OfferHelp from "@/pages/OfferHelp";
import NonprofitDirectory from "@/pages/NonprofitDirectory";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import ProtectedRoute from "@/components/ProtectedRoute";

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
          <Route path="/about" element={<About />} />
          <Route path="/community" element={<Community />} />
          <Route path="/nonprofit-directory" element={<NonprofitDirectory />} />
          
          {/* Routes that require just authentication */}
          <Route element={<ProtectedRoute requireVerified={false} />}>
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          
          {/* Routes that require authentication and email verification */}
          <Route element={<ProtectedRoute requireVerified={true} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/search-help" element={<SearchHelp />} />
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/offer-help" element={<OfferHelp />} />
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
