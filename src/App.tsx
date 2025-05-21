
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import NonprofitDirectory from "./pages/NonprofitDirectory";
import OfferHelp from "./pages/OfferHelp";
import RequestHelp from "./pages/RequestHelp";
import PartnerWithUs from "./pages/PartnerWithUs";
import SearchHelp from "./pages/SearchHelp";
// Ways to Give routes
import Donate from "./pages/Donate";
import MonthlyGiving from "./pages/MonthlyGiving";
import SponsorProject from "./pages/SponsorProject";
import DonateGoods from "./pages/DonateGoods";
import Volunteer from "./pages/Volunteer";
// About routes
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Subscribe from "./pages/Subscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/community" element={<Community />} />
            <Route path="/nonprofits" element={<NonprofitDirectory />} />
            <Route path="/search-help" element={<SearchHelp />} />
            
            {/* Ways to Give public routes */}
            <Route path="/donate" element={<Donate />} />
            <Route path="/monthly-giving" element={<MonthlyGiving />} />
            <Route path="/sponsor-project" element={<SponsorProject />} />
            <Route path="/donate-goods" element={<DonateGoods />} />
            <Route path="/volunteer" element={<Volunteer />} />
            
            {/* About public routes */}
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/subscribe" element={<Subscribe />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/offer-help" element={<OfferHelp />} />
              <Route path="/request-help" element={<RequestHelp />} />
              <Route path="/partner-with-us" element={<PartnerWithUs />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
