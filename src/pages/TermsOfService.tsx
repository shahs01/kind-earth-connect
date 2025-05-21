
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Thryvance's platform and services, you agree to be bound by these Terms of Service.
              If you do not agree to all the terms and conditions, you may not access or use our services.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">2. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide accurate and complete information. You are responsible
              for safeguarding your account password and for any activities that occur under your account. You agree to notify
              us immediately of any unauthorized use of your account.
            </p>
            <p className="text-gray-700 mb-4">
              You may not use as a username the name of another person or entity that is not lawfully available for use, a name
              or trademark that is subject to rights of another person or entity, or a name that is offensive, vulgar, or obscene.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Content</h2>
            <p className="text-gray-700 mb-4">
              Users may post content, including volunteer opportunities, help requests, comments, and messages. You retain ownership
              of your content, but grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display
              your content in connection with our services.
            </p>
            <p className="text-gray-700 mb-4">
              You are responsible for all content you post and represent that you have all rights necessary to grant us the license
              described above. You agree not to post content that violates laws or the rights of others, including intellectual property
              rights, privacy rights, or publicity rights.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">
              When using our platform, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
              <li>Post false, misleading, or deceptive content</li>
              <li>Engage in harassment, hate speech, or bullying</li>
              <li>Post violent, obscene, or offensive content</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use our service for illegal activities</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Interfere with or disrupt our services</li>
              <li>Scrape or collect data without permission</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to our services at our sole discretion, without prior notice or
              liability, for any reason, including but not limited to a breach of these Terms. You may also terminate your account
              at any time by contacting us.
            </p>
            <p className="text-gray-700">
              Upon termination, your right to use the service will immediately cease. All provisions of these Terms that by their
              nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity,
              and limitations of liability.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>By email: terms@thryvance.com</li>
              <li>By mail: Thryvance Legal Team, 123 Community Ave, Suite 100, Anytown, ST 12345</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
