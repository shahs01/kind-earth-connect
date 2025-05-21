
import Navbar from "@/components/Navbar";
import SignUpForm from "@/components/SignUpForm";
import Footer from "@/components/Footer";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <SignUpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
