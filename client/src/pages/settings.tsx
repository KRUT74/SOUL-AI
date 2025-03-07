import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { companionSettings, type CompanionSettings } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CompanionSettings>({
    resolver: zodResolver(companionSettings),
    defaultValues: {
      name: "",
      personality: "",
      interests: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanionSettings) => {
      await apiRequest("POST", "/api/preferences", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your AI companion has been configured",
      });
      setLocation("/chat");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <div className="container max-w-2xl py-10">
        <h1 className="mb-8 text-3xl font-bold text-white">Configure Your AI Companion</h1>

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

              <Button type="submit" className="w-full bg-white/20 hover:bg-white/30 text-white" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Create Companion"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}