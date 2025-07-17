import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { authStorage, type AuthUser } from "@/lib/auth";
import AuthModal from "@/components/auth-modal";
import SubscriptionGuard from "@/components/subscription-guard";
import Home from "@/pages/home";
import SessionTracking from "@/pages/session-tracking";
import RecentSessions from "@/pages/recent-sessions";
import SessionDetails from "@/pages/session-details";
import Progress from "@/pages/progress";
import CbtTools from "@/pages/cbt-tools";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Subscribe from "@/pages/subscribe";
import Membership from "@/pages/membership";
import AchievementsPage from "@/pages/achievements";
import OnboardingTutorial from "@/components/onboarding-tutorial";
import CacheHelper from "@/pages/cache-helper";

import NotFound from "@/pages/not-found";

function Router({ user }: { user: AuthUser }) {
  const [location] = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <Switch>
      {/* Subscribe and membership pages are always accessible */}
      <Route path="/subscribe" component={() => <Subscribe user={user} />} />
      <Route path="/membership" component={() => <Membership user={user} />} />
      <Route path="/cache-helper" component={() => <CacheHelper />} />
      
      {/* All other routes require active subscription */}
      <Route path="/" component={() => (
        <SubscriptionGuard user={user}>
          <Home user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/session-tracking" component={() => (
        <SubscriptionGuard user={user}>
          <SessionTracking user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/sessions" component={() => (
        <SubscriptionGuard user={user}>
          <RecentSessions user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/sessions/:id" component={() => (
        <SubscriptionGuard user={user}>
          <SessionDetails user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/progress" component={() => (
        <SubscriptionGuard user={user}>
          <Progress user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/cbt-tools" component={() => (
        <SubscriptionGuard user={user}>
          <CbtTools user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/profile" component={() => (
        <SubscriptionGuard user={user}>
          <Profile user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/settings" component={() => (
        <SubscriptionGuard user={user}>
          <Settings user={user} />
        </SubscriptionGuard>
      )} />
      <Route path="/achievements" component={() => (
        <SubscriptionGuard user={user}>
          <AchievementsPage user={user} />
        </SubscriptionGuard>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      setShowAuthModal(true);
    }

    // Listen for user profile updates
    const handleUserUpdate = () => {
      const updatedUser = authStorage.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    window.addEventListener('userProfileUpdated', handleUserUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleUserUpdate);
  }, []);

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
    setShowAuthModal(false);
    
    // Show onboarding for new users (who haven't completed it)
    if (!authUser.onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user data to get updated onboarding status
    const updatedUser = authStorage.getUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const handleLogout = () => {
    authStorage.clearUser();
    setUser(null);
    setShowAuthModal(true);
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="bravely-ui-theme">
        <TooltipProvider>
          <div className="max-w-sm mx-auto bg-background min-h-screen shadow-lg relative">
          <Toaster />
          {user ? (
            <Router user={user} />
          ) : (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">💙</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to Bravely</h1>
                <p className="text-muted-foreground">Your personal exposure therapy companion</p>
              </div>
            </div>
          )}
          <AuthModal 
            open={showAuthModal} 
            onOpenChange={setShowAuthModal}
            onSuccess={handleAuthSuccess}
          />
          
          {/* Onboarding Tutorial */}
          {user && (
            <OnboardingTutorial 
              open={showOnboarding} 
              onComplete={handleOnboardingComplete}
              user={user}
            />
          )}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
