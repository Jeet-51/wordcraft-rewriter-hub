
import { useState } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ThankYouMessage } from "@/components/contact/ThankYouMessage";
import { ContactInfo } from "@/components/contact/ContactInfo";

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitSuccess = () => {
    setIsSubmitted(true);
  };

  const handleSendAnother = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Get in Touch
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  We'd love to hear from you. Fill out the form and our team will get back to you as soon as possible.
                </p>
              </div>
              <ContactInfo />
            </div>
            
            <div className="space-y-4">
              {isSubmitted ? (
                <ThankYouMessage onSendAnother={handleSendAnother} />
              ) : (
                <div className="card border-primary/20 shadow-lg backdrop-blur-sm bg-background/80 p-6">
                  <ContactForm onSubmitSuccess={handleSubmitSuccess} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
