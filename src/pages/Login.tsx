
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";
import Footer from "@/components/Footer";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
