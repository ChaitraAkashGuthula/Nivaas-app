import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ExplorePage from "./pages/Explore";
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";

import Profile from "./pages/dashboard/Profile";
import YourProperties from "./pages/dashboard/YourProperties";
import SavedHomes from "./pages/dashboard/SavedHomes";
import SavedSearches from "./pages/dashboard/SavedSearches";
import SettingsPage from "./pages/dashboard/Settings";
import ReviewsPage from "./pages/Reviews";
import SellProperty from "./pages/Sell";

function Router() {
  return (
    <Switch>
      {/* Primary Canonical Routes */}
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/sell" component={SellProperty} />
      <Route path="/saved-properties" component={SavedHomes} />
      <Route path="/saved-searches" component={SavedSearches} />
      <Route path="/your-properties" component={YourProperties} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={SettingsPage} />

      {/* Aliases & Backwards Compatibility */}
      <Route path="/saved-homes" component={SavedHomes} />
      <Route path="/saved" component={SavedHomes} />
      <Route path="/dashboard/saved-homes" component={SavedHomes} />
      <Route path="/dashboard/properties" component={YourProperties} />
      <Route path="/dashboard/searches" component={SavedSearches} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/settings" component={SettingsPage} />
      {/* Explicitly no separate "My NIVAAS" or dashboard layer */}
      <Route path="/dashboard" component={() => <Redirect to="/" />} />

      {/* Authentication & Standalone Pages */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/reviews" component={ReviewsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/property/:slug" component={PropertyDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

