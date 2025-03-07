import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 px-4">
      <div className="mx-auto max-w-4xl pt-20 text-center">
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent sm:text-6xl">
          Your Personal AI Companion
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Create a unique AI friend who understands you, shares your interests, and is always there to chat.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start Fresh</CardTitle>
              <CardDescription>Create your new AI companion</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full">Create Companion</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Continue Chat</CardTitle>
              <CardDescription>Resume your conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full" variant="outline">
                  Open Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
