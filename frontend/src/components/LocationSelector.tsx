import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation } from "lucide-react";
import { toast } from "sonner";
import { locationService } from "@/lib/location/locationService";

const RECENT_LOCATIONS = [
  "Kakinada",
  "Sarpavaram",
  "Ramanayyapeta",
  "Bhanugudi",
  "Ashok Nagar",
  "Indrapalem",
  "Madhavapatnam",
  "Venkat Nagar",
  "Vakalapudi",
  "Jagannaickpur",
  "Turangi",
  "Amalapuram",
];

export function LocationSelector({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentLocation, setCurrentLocation] = useState(() => locationService.getLocation());
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setCurrentLocation(locationService.getLocation());
  }, [open]);

  const handleSelect = (city: string) => {
    locationService.setManualLocation(city);
    setCurrentLocation(locationService.getLocation());
    setOpen(false);
  };

  const handleGeolocation = async () => {
    try {
      setIsLocating(true);
      const data = await locationService.requestCurrentLocation();
      setCurrentLocation(data);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Location access denied. You can choose your location manually.");
    } finally {
      setIsLocating(false);
    }
  };

  const filtered = RECENT_LOCATIONS.filter(l => l.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Choose your location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search city, area or locality" 
              className="pl-9 bg-gray-50 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
            onClick={handleGeolocation}
            disabled={isLocating}
          >
            <Navigation className={`mr-2 h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
            {isLocating ? "Getting location..." : "Use my current location"}
          </Button>

          <div className="pt-2">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent locations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {filtered.map(loc => (
                <Button 
                  key={loc}
                  variant="ghost" 
                  className={`justify-start ${currentLocation.city === loc ? 'bg-orange-50 text-orange-700' : ''}`}
                  onClick={() => handleSelect(loc)}
                >
                  <MapPin className="mr-2 h-4 w-4 opacity-50" />
                  {loc}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useLocationSelector() {
  const [location, setLocation] = useState(() => locationService.getLocation());

  useEffect(() => {
    const fetchLoc = () => setLocation(locationService.getLocation());
    window.addEventListener("nivaas-location-change", fetchLoc);
    return () => window.removeEventListener("nivaas-location-change", fetchLoc);
  }, []);

  return location;
}
