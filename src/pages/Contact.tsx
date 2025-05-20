
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // In a real app with Supabase, we would save this to a contact_messages table
      // Simulating a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Message sent",
        description: "We've received your message and will get back to you soon.",
      });
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Submission error",
        description: error.message || "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Contact Us
              </h1>
              <p className="text-muted-foreground md:text-lg">
                We'd love to hear from you. Fill out the form and our team will get back to you as soon as possible.
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold">Our Address</h3>
                <p className="text-sm text-muted-foreground">
                  123 AI Street, Tech Valley<br />
                  San Francisco, CA 94103<br />
                  United States
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">
                  support@aihumanizer.com
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {isSubmitted ? (
                <div className="rounded-lg border bg-card p-8 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Thank You!</h3>
                  <p className="text-muted-foreground">
                    Your message has been sent successfully. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How can we help you?"
                                className="min-h-32"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
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
