import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { companionSettings, type CompanionSettings } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft } from "lucide-react";
import React from 'react';
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch existing preferences
  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ["/api/preferences", user?.id],
    enabled: !!user
  });

  const form = useForm<CompanionSettings>({
    resolver: zodResolver(companionSettings),
    defaultValues: {
      name: "",
      personality: "",
      interests: [],
      temperature: 50, //Added default value for temperature
    },
  });

  // Set form values when existing preferences are loaded
  React.useEffect(() => {
    if (existingPreferences?.settings) {
      form.reset(existingPreferences.settings);
    }
  }, [existingPreferences, form]);

  const mutation = useMutation({
    mutationFn: async (data: CompanionSettings) => {
      console.log('Submitting companion settings:', data);
      const res = await apiRequest("POST", "/api/preferences", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save settings");
      }
      return res.json();
    },
    onSuccess: (data) => {
      console.log('Successfully saved companion settings:', data);
      toast({
        title: "Settings saved",
        description: "Your AI companion has been configured",
      });
      console.log('Redirecting to /chat...');
      // Invalidate preferences query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/preferences", user?.id] });
      setLocation("/chat");
    },
    onError: (error: Error) => {
      console.error('Failed to save companion settings:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <div className="container max-w-2xl py-10">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/chat")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">
            {existingPreferences?.settings ? "Update" : "Configure"} Your AI Companion
          </h1>
        </div>

        <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Give your companion a name" className="bg-white/20 border-white/20 text-white placeholder:text-white/70" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Personality</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your companion's personality"
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
                      />
                    </FormControl>
                    <FormDescription className="text-white/70">
                      What kind of personality should your companion have?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Interests</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter interests separated by commas"
                        onChange={(e) => field.onChange(e.target.value.split(",").map((i) => i.trim()))}
                        value={field.value?.join(", ")}
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
                      />
                    </FormControl>
                    <FormDescription className="text-white/70">
                      What topics should your companion be knowledgeable about?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-white">Response Variability</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          {...field}
                          value={[value ?? 50]}
                          onValueChange={(vals) => onChange(vals[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="py-2"
                        />
                        <div className="flex justify-between text-sm text-white/70">
                          <span>Consistent</span>
                          <span>{value}%</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-white/70">
                      Adjust how varied and creative the AI's responses will be
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-white/20 hover:bg-white/30 text-white" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : existingPreferences?.settings ? "Update Companion" : "Create Companion"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}