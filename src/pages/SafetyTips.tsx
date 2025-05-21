
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SafetyTips = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Safety Tips</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Personal Safety</h2>
            <p className="text-gray-700 mb-4">
              Your safety is our top priority. Here are some guidelines to keep in mind when engaging with our community:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 mb-6">
              <li>Always meet in public places for initial meetings</li>
              <li>Tell someone you trust about your plans, including where you're going and who you're meeting</li>
              <li>Keep your personal information private until you've established trust</li>
              <li>Trust your instincts - if something doesn't feel right, it's okay to leave or cancel</li>
              <li>Consider bringing a friend when meeting someone for the first time</li>
              <li>Maintain healthy boundaries in all community interactions</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Online Safety</h2>
            <p className="text-gray-700 mb-4">
              When using our platform and communicating online:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 mb-6">
              <li>Use strong, unique passwords for your account</li>
              <li>Be cautious about clicking on links sent through private messages</li>
              <li>Never share financial information with other community members</li>
              <li>Report suspicious behavior or messages immediately</li>
              <li>Be mindful of the personal information you share in your profile and posts</li>
              <li>Log out of your account when using shared or public computers</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Volunteering Safety</h2>
            <p className="text-gray-700 mb-4">
              When volunteering in the community:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 mb-6">
              <li>Research the organization or individual you'll be volunteering with</li>
              <li>Understand what your role and responsibilities will be</li>
              <li>Know the physical requirements of the volunteer activity</li>
              <li>Wear appropriate clothing and safety equipment if needed</li>
              <li>Follow all safety protocols and instructions from volunteer coordinators</li>
              <li>Inform the organization of any health concerns or limitations</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Report Concerns</h2>
            <p className="text-gray-700 mb-4">
              If you experience or witness anything that makes you uncomfortable or seems unsafe:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-5">
              <li>Use the reporting feature in the platform to alert our team</li>
              <li>Email us directly at safety@thryvance.com</li>
              <li>In case of emergency, always contact local authorities first</li>
            </ul>
            <p className="text-gray-700">
              We take all reports seriously and will investigate promptly to maintain a safe community environment.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyTips;
