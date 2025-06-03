import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const faqs = [
    {
      category: "General Questions",
      questions: [
        {
          question: "What is Thryvance?",
          answer: "Thryvance is a community platform that connects people who want to offer help with those who need it. We facilitate resource sharing, community connection, and support for nonprofits and community initiatives."
        },
        {
          question: "How does Thryvance work?",
          answer: "Our platform allows individuals to post offers of help or requests for assistance. We also feature nonprofit organizations, community projects, and various ways to contribute through donations, volunteering, or sharing professional services."
        },
        {
          question: "Is Thryvance available in my area?",
          answer: "Thryvance is currently available in select cities across the United States. We're expanding rapidly, so if we're not in your area yet, sign up for our newsletter to be notified when we launch near you."
        },
        {
          question: "Do I need to create an account to use Thryvance?",
          answer: "While you can browse the platform without an account, creating a free account allows you to post offers or requests, message other users, and receive notifications relevant to your interests and location."
        }
      ]
    },
    {
      category: "Offering & Requesting Help",
      questions: [
        {
          question: "How do I offer help to my community?",
          answer: "Simply create an account, navigate to the 'Offer Help' section, and fill out the form detailing what type of assistance you can provide, when, and any other relevant information."
        },
        {
          question: "How do I request help?",
          answer: "Create an account, go to the 'Request Help' section, and fill out the form with details about what you need. Our system will help connect you with relevant offers or organizations."
        },
        {
          question: "Is there a fee to use Thryvance?",
          answer: "No, Thryvance is free for individuals to use when offering or requesting help. We sustain our platform through partnerships, grants, and optional donations."
        },
        {
          question: "How does Thryvance ensure safety and privacy?",
          answer: "We have verification processes in place, community guidelines, and privacy controls. All users agree to our code of conduct, and we provide tools to report any concerns."
        }
      ]
    },
    {
      category: "Donations & Volunteering",
      questions: [
        {
          question: "Are my donations tax-deductible?",
          answer: "Currently, donations made through Thryvance are not tax-deductible. We are working toward obtaining the necessary certifications and registrations to make donations tax-deductible in the future. We appreciate your understanding and continued support as we work through this process."
        },
        {
          question: "Can I designate where my donation goes?",
          answer: "Yes, you can choose to support specific projects, organizations, or our general community fund which is distributed based on current needs."
        },
        {
          question: "What kinds of volunteer opportunities are available?",
          answer: "We offer a wide range of volunteer opportunities including one-time events, ongoing positions, remote options, and skill-based volunteering. Browse our 'Volunteer' section to see current needs."
        },
        {
          question: "How do I know my donation is making an impact?",
          answer: "We provide regular updates on projects and initiatives supported by donations. For specific projects, you'll receive progress reports and completion notifications."
        }
      ]
    },
    {
      category: "Nonprofits & Partners",
      questions: [
        {
          question: "How can my nonprofit join Thryvance?",
          answer: "Visit our 'Partner With Us' page to learn about the application process. We verify all organizations before they join our platform."
        },
        {
          question: "What benefits do nonprofits get from Thryvance?",
          answer: "Nonprofit partners gain increased visibility, access to volunteers, potential funding, and connections to other organizations and resources in the community."
        },
        {
          question: "Can businesses partner with Thryvance?",
          answer: "Yes, we welcome business partners who want to contribute to community initiatives. Businesses can offer resources, volunteer time, or financial support through our platform."
        },
        {
          question: "How are partner organizations vetted?",
          answer: "We verify nonprofit status, review mission alignment, check references, and ensure transparency in operations before approving organizations to join our platform."
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="relative mb-8">
              <Input 
                type="text" 
                placeholder="Search frequently asked questions..." 
                className="pl-10"
              />
              <svg 
                className="absolute left-3 top-3 h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            
            {faqs.map((category, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Still Have Questions?</h2>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for in our FAQ? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-thryvance-green hover:bg-thryvance-green-dark flex-1">
                Contact Support
              </Button>
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light flex-1">
                View Help Center
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
