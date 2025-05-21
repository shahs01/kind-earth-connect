
import Navbar from "@/components/Navbar";
import OfferHelpForm from "@/components/OfferHelpForm";
import Footer from "@/components/Footer";

const OfferHelp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <OfferHelpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfferHelp;
