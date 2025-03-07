import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserMenu } from "@/components/user-menu";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 px-4">
      <header className="absolute top-0 right-0 p-4">
        <UserMenu />
      </header>
      <div className="mx-auto max-w-4xl pt-20 text-center">
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Soulmate AI
        </h1>
        <p className="mt-6 text-lg text-white/90">
          Create your perfect AI companion who understands you, shares your interests, and is always there to chat.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Start Fresh</CardTitle>
              <CardDescription className="text-white/70">Create your new AI companion</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">Create Companion</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Continue Chat</CardTitle>
              <CardDescription className="text-white/70">Resume your conversation</CardDescription>
            </CardHeader>
            <CardContent>
              {preferences ? (
                <Link href="/chat">
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white" variant="outline">
                    Open Chat
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="w-full bg-white/20 hover:bg-white/30 text-white opacity-50" 
                  variant="outline" 
                  disabled
                  title="Configure your AI companion first"
                >
                  Setup Required
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}