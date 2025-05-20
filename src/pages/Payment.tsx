import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updateProfile, createPaymentRecord } from "@/lib/supabase";

const formSchema = z.object({
  cardName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cardCvc: z
    .string()
    .min(3, "CVC must be 3-4 digits")
    .max(4, "CVC must be 3-4 digits")
    .regex(/^\d+$/, "CVC must contain only digits"),
});

type FormData = z.infer<typeof formSchema>;

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get("plan") || "pro";

  const planDetails = {
    free: { name: "Free", credits: 10, price: "$0" },
    pro: { name: "Pro", credits: 100, price: "$19/month" },
    enterprise: { name: "Enterprise", credits: 500, price: "$49/month" },
  };

  const selectedPlan = planDetails[planId as keyof typeof planDetails];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to complete this purchase",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setIsLoading(true);

      // In a real app, we would process payment here
      // For this demo, we'll simulate a successful payment

      // Update user credits based on the selected plan
      const profile = await getProfile(user.id);
      
      await updateProfile(user.id, {
        credits_total: selectedPlan.credits,
        credits_used: 0,
        plan: planId as 'free' | 'pro' | 'enterprise'
      });

      // Create a payment record in the database
      await createPaymentRecord(
        user.id,
        planId,
        selectedPlan.name,
        selectedPlan.price
      );

      toast({
        title: "Payment successful",
        description: `You've been upgraded to the ${selectedPlan.name} plan with ${selectedPlan.credits} credits.`,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete your purchase</CardTitle>
          <CardDescription>
            You're subscribing to the {selectedPlan.name} plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="font-medium">{selectedPlan.name} Plan</span>
              <span>{selectedPlan.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPlan.credits} credits
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="4242424242424242" 
                        maxLength={16}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cardExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY"
                          maxLength={5} 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardCvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          maxLength={4}
                          {...field}
                          disabled={isLoading} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Payment"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Your payment information is secure and encrypted
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Payment;
