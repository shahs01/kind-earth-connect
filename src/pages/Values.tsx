
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Values = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-thryvance-green">Our Values</h1>
        
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-thryvance-green">Community First</h2>
            <p className="text-gray-700 mb-4">
              We believe in the power of communities coming together to solve problems. Every decision we make is guided by what's best for the communities we serve.
            </p>
            <p className="text-gray-700">
              Our platform is designed to foster meaningful connections and strengthen local support networks that can sustain themselves long after our intervention.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-thryvance-green">Kindness & Empathy</h2>
            <p className="text-gray-700 mb-4">
              We approach every interaction with kindness and empathy, recognizing that each person's circumstances are unique and deserving of respect.
            </p>
            <p className="text-gray-700">
              By fostering a culture of compassion, we create space for genuine connection and mutual understanding between those offering and seeking help.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-thryvance-green">Inclusivity</h2>
            <p className="text-gray-700 mb-4">
              We are committed to making our platform accessible to everyone, regardless of background, ability, or circumstance.
            </p>
            <p className="text-gray-700">
              We actively work to remove barriers to participation and ensure that every voice in our community is heard and valued.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-thryvance-green">Transparency & Trust</h2>
            <p className="text-gray-700 mb-4">
              We operate with complete transparency in our actions, decisions, and use of resources.
            </p>
            <p className="text-gray-700">
              Trust is the foundation of our community, and we earn it by being accountable to our users and stakeholders in everything we do.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-thryvance-green">Sustainable Impact</h2>
            <p className="text-gray-700 mb-4">
              We measure our success not by short-term metrics but by the lasting positive change we help create in communities.
            </p>
            <p className="text-gray-700">
              By connecting people with the right resources and building capacity within communities, we aim to create impacts that endure and grow over time.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Values;
