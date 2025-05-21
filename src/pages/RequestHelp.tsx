
import Navbar from "@/components/Navbar";
import RequestHelpForm from "@/components/RequestHelpForm";
import Footer from "@/components/Footer";

const RequestHelp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <RequestHelpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestHelp;
