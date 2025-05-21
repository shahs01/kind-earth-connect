
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              At Thryvance, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share
              your personal information when you use our platform. By using Thryvance, you agree to the collection and use
              of information in accordance with this policy.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect several types of information for various purposes:
            </p>
            <h3 className="text-lg font-medium mb-2">Personal Data</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Profile information you provide (biography, skills, interests)</li>
              <li>Geographic location information you choose to share</li>
              <li>Content you post, including volunteer opportunities and help requests</li>
              <li>Messages you exchange with other users</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2">Usage Data</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
              <li>Information on how you interact with our platform</li>
              <li>Access times, pages viewed, and features used</li>
              <li>Browser type, device information, and IP address</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 mb-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To match volunteers with opportunities</li>
              <li>To facilitate community connections</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sharing Your Information</h2>
            <p className="text-gray-700 mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 mb-6">
              <li>Other users when you choose to make your profile or posts public</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Partners who help provide additional services (with your consent)</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p className="text-gray-700">
              We do not sell your personal information to third parties.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Data Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Restrict or object to processing of your personal data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, please contact us at privacy@thryvance.com.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>By email: privacy@thryvance.com</li>
              <li>By mail: Thryvance Privacy Team, 123 Community Ave, Suite 100, Anytown, ST 12345</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
