import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      await apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: isLogin ? "Welcome back!" : "Account created",
        description: isLogin ? "Successfully logged in" : "Your account has been created",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: isLogin ? "Invalid credentials" : "Username already exists",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <div className="container grid gap-8 pt-20 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
            <h1 className="mb-8 text-3xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white/20 border-white/20 text-white placeholder:text-white/70" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Loading..." : isLogin ? "Login" : "Create Account"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white hover:bg-white/20"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Personal AI Companion</h2>
            <p className="mb-4">Create your own customized AI companion with unique personality traits and interests.</p>
            <ul className="space-y-2">
              <li>✨ Personalized conversations</li>
              <li>🎭 Custom personality traits</li>
              <li>🌟 Shared interests and hobbies</li>
              <li>🗣️ Voice interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
