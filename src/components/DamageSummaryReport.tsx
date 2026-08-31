import React, { useState, useEffect } from "react";
import { DamageAssessment, DamageDetail } from "../types";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  RefreshCw, 
  X,
  FileCheck,
  Check,
  FileDown,
  Loader2,
  MapPin,
  Phone,
  Navigation,
  Award,
  Search,
  Compass,
  Map,
  Star,
  Locate,
  Share2,
  Link,
  Copy,
  Clock,
  ExternalLink
} from "lucide-react";

interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  rating: number;
  phone: string;
  specialty: string;
  certifiedBrand: string;
}

const INDIAN_WORKSHOPS: Workshop[] = [
  // Delhi NCR
  {
    id: "delhi-1",
    name: "GoMechanic - Car Care Sector 5",
    address: "Plot No. 12, Sector 5, Near Huda City Centre, Gurugram, Haryana",
    city: "Delhi NCR",
    pinCode: "122001",
    latitude: 28.4595,
    longitude: 77.0266,
    rating: 4.8,
    phone: "+91 98110 12345",
    specialty: "Body Repair & OEM Painting",
    certifiedBrand: "Maruti, Hyundai, Tata Certified"
  },
  {
    id: "delhi-2",
    name: "MyTVS - Premium Car Service Noida",
    address: "C-56, Phase 2, Industrial Area, Noida, Uttar Pradesh",
    city: "Delhi NCR",
    pinCode: "201301",
    latitude: 28.5355,
    longitude: 77.3910,
    rating: 4.7,
    phone: "+91 98110 54321",
    specialty: "Advanced Structural Alignment & Denting",
    certifiedBrand: "Mahindra & Honda Certified"
  },
  {
    id: "delhi-3",
    name: "Bosch Car Service - Auto Dynamic",
    address: "Phase III, Okhla Industrial Estate, New Delhi",
    city: "Delhi",
    pinCode: "110020",
    latitude: 28.5300,
    longitude: 77.2700,
    rating: 4.9,
    phone: "+91 99110 98765",
    specialty: "Full Collision Restoration & Paint Booth",
    certifiedBrand: "Bosch Multi-brand Certified"
  },
  // Mumbai
  {
    id: "mumbai-1",
    name: "Maruti Suzuki Arena - Spectra Motors",
    address: "Link Road, Kora Kendra, Borivali West, Mumbai, Maharashtra",
    city: "Mumbai",
    pinCode: "400092",
    latitude: 19.2290,
    longitude: 72.8573,
    rating: 4.8,
    phone: "+91 98200 11111",
    specialty: "OEM Sheet Metal Repair & Frame Straightening",
    certifiedBrand: "Maruti Suzuki Certified"
  },
  {
    id: "mumbai-2",
    name: "GoMechanic - Midland Auto Andheri",
    address: "Mathuradas Vasanji Rd, Marol, Andheri East, Mumbai, Maharashtra",
    city: "Mumbai",
    pinCode: "400069",
    latitude: 19.1179,
    longitude: 72.8631,
    rating: 4.6,
    phone: "+91 98200 22222",
    specialty: "Fiberglass Repair & Scratch Removal",
    certifiedBrand: "Hyundai & Kia Certified"
  },
  {
    id: "mumbai-3",
    name: "MyTVS Premium Car Care Thane",
    address: "Ghodbunder Road, Near Patlipada, Thane West, Maharashtra",
    city: "Thane",
    pinCode: "400601",
    latitude: 19.2183,
    longitude: 72.9781,
    rating: 4.7,
    phone: "+91 98200 33333",
    specialty: "Aluminium Body Denting & Premium Glaze",
    certifiedBrand: "Skoda, Volkswagen Certified"
  },
  // Bengaluru
  {
    id: "blr-1",
    name: "Bosch Car Service - Trident Service",
    address: "Outer Ring Rd, Doddanekundi, Whitefield, Bengaluru, Karnataka",
    city: "Bengaluru",
    pinCode: "560066",
    latitude: 12.9698,
    longitude: 77.7499,
    rating: 4.9,
    phone: "+91 98450 44444",
    specialty: "Precision Panel Beating & High-Gloss Clearcoat",
    certifiedBrand: "BMW & Mercedes Accredited"
  },
  {
    id: "blr-2",
    name: "GoMechanic - Engine Room Koramangala",
    address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka",
    city: "Bengaluru",
    pinCode: "560034",
    latitude: 12.9279,
    longitude: 77.6271,
    rating: 4.7,
    phone: "+91 98450 55555",
    specialty: "Bumper Welding & Express Scratch Repair",
    certifiedBrand: "Toyota & Honda Certified"
  },
  {
    id: "blr-3",
    name: "Pitstop - Multi Brand Repair HSR",
    address: "19th Main Road, Sector 3, HSR Layout, Bengaluru, Karnataka",
    city: "Bengaluru",
    pinCode: "560102",
    latitude: 12.9116,
    longitude: 77.6389,
    rating: 4.5,
    phone: "+91 98450 66666",
    specialty: "Bumper/Fender Alignment & Dent Repair",
    certifiedBrand: "Mahindra & Tata Certified"
  },
  // Chennai
  {
    id: "chennai-1",
    name: "MyTVS - Premium Multi Brand Guindy",
    address: "Industrial Estate, Guindy, Chennai, Tamil Nadu",
    city: "Chennai",
    pinCode: "600032",
    latitude: 13.0102,
    longitude: 80.2156,
    rating: 4.8,
    phone: "+91 98400 77777",
    specialty: "Infrared Paint Curing & Frame Correction",
    certifiedBrand: "Hyundai & Nissan Certified"
  },
  {
    id: "chennai-2",
    name: "GoMechanic - Auto Spark Adyar",
    address: "Latice Bridge Road, Adyar, Chennai, Tamil Nadu",
    city: "Chennai",
    pinCode: "600020",
    latitude: 13.0063,
    longitude: 80.2574,
    rating: 4.6,
    phone: "+91 98400 88888",
    specialty: "Panel Scratch Repair & Paintless Dent Removal (PDR)",
    certifiedBrand: "Renault & Ford Certified"
  },
  // Hyderabad
  {
    id: "hyd-1",
    name: "MyTVS - Premium Services Gachibowli",
    address: "Gachibowli Main Road, Opp DLF IT Park, Hyderabad, Telangana",
    city: "Hyderabad",
    pinCode: "500032",
    latitude: 17.4401,
    longitude: 78.3489,
    rating: 4.8,
    phone: "+91 98850 99999",
    specialty: "Premium Painting, Underbody Coating & Detailing",
    certifiedBrand: "Audi, Volvo Certified Specialists"
  },
  {
    id: "hyd-2",
    name: "Bosch Car Service - Auto Kraft",
    address: "M.G. Road, Secunderabad, Hyderabad, Telangana",
    city: "Hyderabad",
    pinCode: "500003",
    latitude: 17.4399,
    longitude: 78.4983,
    rating: 4.7,
    phone: "+91 98850 88888",
    specialty: "Complete Accident Repair & Cashless Workshop",
    certifiedBrand: "Tata & MG Motor Certified"
  },
  // Kolkata
  {
    id: "kol-1",
    name: "Bosch Car Service - Speed Wheels",
    address: "Sector V, Salt Lake City, Kolkata, West Bengal",
    city: "Kolkata",
    pinCode: "700091",
    latitude: 22.5726,
    longitude: 88.4339,
    rating: 4.8,
    phone: "+91 98300 12345",
    specialty: "Baked Paint Booth & Structural Realignment",
    certifiedBrand: "Mahindra & Kia Certified"
  },
  {
    id: "kol-2",
    name: "GoMechanic - Auto Plaza Howrah",
    address: "G.T. Road, Howrah, West Bengal",
    city: "Kolkata",
    pinCode: "711101",
    latitude: 22.5958,
    longitude: 88.2636,
    rating: 4.5,
    phone: "+91 98300 54321",
    specialty: "Fast-Track Denting & Painting Services",
    certifiedBrand: "Maruti & Hyundai Certified"
  },
  // Pune
  {
    id: "pune-1",
    name: "GoMechanic - Horizon Car Clinic Baner",
    address: "Baner Road, Near Balewadi High Street, Pune, Maharashtra",
    city: "Pune",
    pinCode: "411045",
    latitude: 18.5597,
    longitude: 73.7799,
    rating: 4.8,
    phone: "+91 98900 12345",
    specialty: "Premium Paint Matching & Scratch Erase",
    certifiedBrand: "Skoda, Volkswagen, Audi Certified"
  },
  {
    id: "pune-2",
    name: "MyTVS - Express Repair Hadapsar",
    address: "Solapur Road, Hadapsar, Pune, Maharashtra",
    city: "Pune",
    pinCode: "411028",
    latitude: 18.5089,
    longitude: 73.9259,
    rating: 4.6,
    phone: "+91 98900 54321",
    specialty: "Cashless Claims & Accidental Denting/Painting",
    certifiedBrand: "Tata, Mahindra & Toyota Certified"
  }
];

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Helper functions to convert OKLCH color strings to standard RGB(A)
// This is critical to prevent html2canvas from throwing "Attempting to parse an unsupported color function"
function oklchToRgb(oklchStr: string): string {
  const cleanStr = oklchStr.replace(/,/g, " ");
  const match = cleanStr.match(/oklch\s*\(\s*([\d\.%]+)\s+([\d\.]+)\s+([\d\.]+)(?:\s*\/\s*([\d\.%]+))?\s*\)/i);
  if (!match) return "rgb(100, 116, 139)"; // Fallback grey

  const l = match[1].endsWith("%") ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  const a = match[4] ? (match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4])) : 1;

  const hRad = (h * Math.PI) / 180;
  const a_lab = c * Math.cos(hRad);
  const b_lab = c * Math.sin(hRad);

  const l_lms = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_lms = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_lms = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

  const l_cube = l_lms * l_lms * l_lms;
  const m_cube = m_lms * m_lms * m_lms;
  const s_cube = s_lms * s_lms * s_lms;

  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.7076147010 * s_cube;

  const f = (x: number) => (x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x);
  const r = Math.min(255, Math.max(0, Math.round(f(r_lin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(f(g_lin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(f(b_lin) * 255)));

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function replaceOklchInString(str: string): string {
  if (typeof str !== "string" || !str.includes("oklch")) return str;
  return str.replace(/oklch\([^\)]*\)/gi, (match) => {
    try {
      return oklchToRgb(match);
    } catch (e) {
      return "rgb(100, 116, 139)";
    }
  });
}

// Dynamic showroom and insurance threshold logic for deciding Repair vs Replace
const getRecommendedAction = (partName: string, damagePercentage: number, description?: string): "Repair" | "Replace" => {
  const name = (partName || "").toLowerCase();
  const desc = (description || "").toLowerCase();

  // 1. PLASTIC PARTS: Front Bumper, Rear Bumper, Grille, Headlights, Side Mirrors, or any plastic
  if (
    name.includes("bumper") || 
    name.includes("grille") || 
    name.includes("grill") || 
    name.includes("headlight") || 
    name.includes("headlamp") || 
    name.includes("light") || 
    name.includes("lamp") || 
    name.includes("mirror") ||
    name.includes("plastic")
  ) {
    const hasFracture = 
      desc.includes("clip") || 
      desc.includes("crack") || 
      desc.includes("fracture") || 
      desc.includes("broken") || 
      desc.includes("shattered") || 
      desc.includes("snap") || 
      desc.includes("rupture") || 
      desc.includes("split");
    
    if (damagePercentage > 15 || hasFracture) {
      return "Replace";
    }
    return "Repair";
  }

  // 3. STRUCTURAL & SAFETY PARTS: A/B/C Pillars, Chassis, Apron, Impact Beams
  if (
    name.includes("pillar") || 
    name.includes("chassis") || 
    name.includes("apron") || 
    name.includes("beam") || 
    name.includes("frame")
  ) {
    if (damagePercentage >= 5) {
      return "Replace";
    }
    return "Repair";
  }

  // 2. METAL BODY PANELS: Hood, Front/Rear Doors, Fenders, Tailgate
  if (
    name.includes("hood") || 
    name.includes("bonnet") || 
    name.includes("door") || 
    name.includes("fender") ||
    name.includes("panel") ||
    name.includes("tailgate") ||
    name.includes("boot") ||
    name.includes("trunk") ||
    name.includes("metal")
  ) {
    const hasDeepCrease = 
      desc.includes("deep crease") || 
      desc.includes("sharp fold") || 
      desc.includes("sharp metal fold") || 
      desc.includes("crease") || 
      desc.includes("fold") || 
      desc.includes("crumpled") || 
      desc.includes("crushed") ||
      desc.includes("severely bent");
    
    if (damagePercentage > 30 || hasDeepCrease) {
      return "Replace";
    }
    return "Repair";
  }

  // Glass fallback
  if (
    name.includes("windshield") || 
    name.includes("window") || 
    name.includes("glass")
  ) {
    return damagePercentage > 10 ? "Replace" : "Repair";
  }

  // Default fallback for other components
  return damagePercentage > 20 ? "Replace" : "Repair";
};

// Fallback percentage estimation for legacy or manual parts missing percentage
const getFallbackPercentage = (partName: string, action: string): number => {
  const name = (partName || "").toLowerCase();
  const isReplace = (action || "").toLowerCase() === "replace";
  
  if (
    name.includes("bumper") || 
    name.includes("grille") || 
    name.includes("grill") || 
    name.includes("headlight") || 
    name.includes("headlamp") || 
    name.includes("light") || 
    name.includes("lamp") || 
    name.includes("mirror")
  ) {
    return isReplace ? 25 : 12;
  }
  
  if (
    name.includes("windshield") || 
    name.includes("window") || 
    name.includes("glass") || 
    name.includes("pillar") || 
    name.includes("chassis")
  ) {
    return isReplace ? 15 : 8;
  }
  
  return isReplace ? 45 : 20;
};

interface DamageSummaryReportProps {
  assessment: DamageAssessment;
  onUpdateAssessment: (updated: DamageAssessment) => void;
  onReset: () => void;
  currency?: "INR" | "USD";
  selectedPart?: string | null;
  onSelectPart?: (partName: string | null) => void;
  readOnly?: boolean;
  customImage?: string | null;
  selectedSample?: any | null;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  onCustomerNameChange?: (val: string) => void;
  onCustomerPhoneChange?: (val: string) => void;
  onCustomerAddressChange?: (val: string) => void;
}

// Custom Tooltip component matching the elegant slate theme
const CustomTooltip = ({ active, payload, currency = "INR" }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedCost = currency === "USD"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(data.cost)
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(data.cost);

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 font-sans min-w-[180px]">
        <p className="font-extrabold text-slate-100">{data.name}</p>
        <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1.5 mt-1">
          <span className="text-slate-400">Est. Cost:</span>
          <span className="font-mono text-sky-400 font-bold">{formattedCost}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Action:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
            data.action === "Replace" ? "bg-rose-500/20 text-rose-300" : "bg-sky-500/20 text-sky-300"
          }`}>
            {data.action}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DamageSummaryReport({ 
  assessment, 
  onUpdateAssessment, 
  onReset,
  currency = "INR",
  selectedPart = null,
  onSelectPart = () => {},
  readOnly = false,
  customImage = null,
  selectedSample = null,
  customerName = "",
  customerPhone = "",
  customerAddress = "",
  onCustomerNameChange = () => {},
  onCustomerPhoneChange = () => {},
  onCustomerAddressChange = () => {}
}: DamageSummaryReportProps) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPartName, setEditPartName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAction, setEditAction] = useState<"Repair" | "Replace">("Repair");
  const [editCost, setEditCost] = useState<number>(0);
  const [editPercentage, setEditPercentage] = useState<number>(0);

  // New part form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAction, setNewAction] = useState<"Repair" | "Replace">("Repair");
  const [newCost, setNewCost] = useState<string>("");
  const [newPercentage, setNewPercentage] = useState<string>("10");

  // Automatically update edited action based on name and percentage updates
  useEffect(() => {
    if (editingIndex !== null) {
      const calculatedAction = getRecommendedAction(editPartName, editPercentage, editDesc);
      if (calculatedAction !== editAction) {
        setEditAction(calculatedAction);
      }
    }
  }, [editPartName, editPercentage, editDesc, editingIndex]);

  // Automatically update added action based on name and percentage updates
  useEffect(() => {
    if (showAddForm) {
      const calculatedAction = getRecommendedAction(newPartName, Number(newPercentage) || 0, newDesc);
      if (calculatedAction !== newAction) {
        setNewAction(calculatedAction);
      }
    }
  }, [newPartName, newPercentage, newDesc, showAddForm]);

  // Sharing and deep-link generation state
  const [showShareModal, setShowShareModal] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(1440);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch("/api/appraisal/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessment,
          customImage,
          selectedSampleId: selectedSample?.id || null,
          currency,
          expiresInMinutes: expiryMinutes,
          customerName,
          customerPhone,
          customerAddress
        })
      });
      const data = await response.json();
      if (data.success) {
        const url = `${window.location.origin}${window.location.pathname}?shareId=${data.id}`;
        setShareUrl(url);
      } else {
        console.error("Sharing failed:", data.error);
      }
    } catch (err) {
      console.error("Sharing error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print view state
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // Geolocation and certified workshop state variables
  const [pinCodeOrCity, setPinCodeOrCity] = useState("");
  const [nearbyWorkshops, setNearbyWorkshops] = useState<(Workshop & { distance?: number })[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [workshopLoading, setWorkshopLoading] = useState(false);
  const [workshopSearchError, setWorkshopSearchError] = useState<string | null>(null);
  const [resolvedPostalInfo, setResolvedPostalInfo] = useState<{ postOffice: string; district: string; state: string } | null>(null);

  // Pre-populate workshops on mount
  useEffect(() => {
    const initial = [...INDIAN_WORKSHOPS].sort((a, b) => b.rating - a.rating).slice(0, 3);
    setNearbyWorkshops(initial);
  }, []);

  const handleAutoGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    setWorkshopSearchError(null);
    setResolvedPostalInfo(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setGeoLoading(false);
        
        // Find nearest workshops using Haversine formula
        const sorted = [...INDIAN_WORKSHOPS].map(ws => {
          const distance = getHaversineDistance(latitude, longitude, ws.latitude, ws.longitude);
          return { ...ws, distance };
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setNearbyWorkshops(sorted.slice(0, 3));
        
        // Set display to show coordinates or city
        if (sorted.length > 0 && sorted[0].distance !== undefined && sorted[0].distance < 100) {
          setPinCodeOrCity(sorted[0].city);
        } else {
          setPinCodeOrCity(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      },
      (error) => {
        console.warn("Geolocation access failed:", error);
        setGeoLoading(false);
        if (error.code === 1) {
          setGeoError("Location access denied. Please enter a city name or PIN code manually.");
        } else {
          setGeoError("Unable to retrieve location. Please search manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearchManual = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setUserLocation(null); // Clear geolocated coordinates to indicate manual search is active
    setResolvedPostalInfo(null);
    setWorkshopSearchError(null);

    // Check if it's a 6-digit pin code
    const isPinCode = /^\d{6}$/.test(cleanQuery);
    
    if (!isPinCode) {
      setNearbyWorkshops([]);
      setWorkshopSearchError("No certified workshops found in this pincode. Please try an adjacent area or contact support.");
      return;
    }

    setWorkshopLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${cleanQuery}`);
      if (!response.ok) {
        throw new Error("Postal API request failed");
      }
      const data = await response.json();
      
      // The API returns an array of responses. Let's check the Status in the first element
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const officeName = postOffice.Name;
        const district = postOffice.District;
        const state = postOffice.State;
        const resolvedPincode = postOffice.Pincode;

        // Simulated Out of Service Rule: Pincodes starting with 7 or 8, or ending with 9 have no cashless tie-ups.
        const isRegionOutOfService = resolvedPincode.startsWith("7") || resolvedPincode.startsWith("8") || resolvedPincode.endsWith("9");

        if (isRegionOutOfService) {
          setNearbyWorkshops([]);
          setWorkshopSearchError("No certified workshops found in this pincode. Please try an adjacent area or contact support.");
          setResolvedPostalInfo({ postOffice: officeName, district, state });
        } else {
          // Dynamically generate realistic authorized and multi-brand workshop cards tailored directly to that resolved district and city name
          const generated: (Workshop & { distance?: number })[] = [
            {
              id: `dyn-ws-1-${resolvedPincode}`,
              name: `${district} Maruti Authorized Care`,
              address: `Plot No. 45, Near ${officeName} Post Office, ${district}, ${state} - ${resolvedPincode}`,
              city: district,
              pinCode: resolvedPincode,
              latitude: 0,
              longitude: 0,
              rating: 4.8,
              phone: `+91 98110 ${10000 + (parseInt(resolvedPincode) % 90000)}`,
              specialty: "OEM Painting & Sheet Metal Denting",
              certifiedBrand: "Maruti Suzuki & Hyundai Certified"
            },
            {
              id: `dyn-ws-2-${resolvedPincode}`,
              name: `${officeName} Multi-brand Repair Hub`,
              address: `Opposite Metro Station, ${officeName}, ${district}, ${state} - ${resolvedPincode}`,
              city: district,
              pinCode: resolvedPincode,
              latitude: 0,
              longitude: 0,
              rating: 4.6,
              phone: `+91 99550 ${12000 + (parseInt(resolvedPincode) % 80000)}`,
              specialty: "Advanced Collision Repair & Structural Alignment",
              certifiedBrand: "Bosch Multi-brand Certified"
            },
            {
              id: `dyn-ws-3-${resolvedPincode}`,
              name: `${district} Multi-brand Body Workshop`,
              address: `Survey No. 104, Industrial Estate, near ${officeName}, ${district}, ${state} - ${resolvedPincode}`,
              city: district,
              pinCode: resolvedPincode,
              latitude: 0,
              longitude: 0,
              rating: 4.7,
              phone: `+91 97220 ${15000 + (parseInt(resolvedPincode) % 70000)}`,
              specialty: "Cash-less Denting, Painting & Windshield Replacement",
              certifiedBrand: "Mahindra, Tata & Honda Certified"
            }
          ];
          setNearbyWorkshops(generated);
          setResolvedPostalInfo({ postOffice: officeName, district, state });
        }
      } else {
        setNearbyWorkshops([]);
        setWorkshopSearchError("No certified workshops found in this pincode. Please try an adjacent area or contact support.");
      }
    } catch (err) {
      console.error("Error fetching pincode info:", err);
      setNearbyWorkshops([]);
      setWorkshopSearchError("No certified workshops found in this pincode. Please try an adjacent area or contact support.");
    } finally {
      setWorkshopLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val / 95.34);
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minor":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          badge: "bg-emerald-500 text-white",
          iconColor: "text-emerald-500",
          desc: "The vehicle sustained minor surface damage. It is safe to drive, and only cosmetic corrections are required."
        };
      case "moderate":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          badge: "bg-amber-500 text-white",
          iconColor: "text-amber-500",
          desc: "The vehicle sustained moderate impact. Outer panels and light assemblies require servicing before safe highway operation."
        };
      case "severe":
      default:
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-800",
          badge: "bg-rose-600 text-white",
          iconColor: "text-rose-600",
          desc: "The vehicle sustained severe damage. Crucial structural panels or safety components are compromised. Professional workshop towing is advised."
        };
    }
  };

  const severityInfo = getSeverityStyles(assessment.overall_damage_severity);

  // Compute sorted chart data for cost distribution visualizer
  const chartData = [...assessment.damage_details]
    .sort((a, b) => b.estimated_cost_INR - a.estimated_cost_INR)
    .map((part) => ({
      name: part.part_name,
      displayName: part.part_name.length > 20 ? part.part_name.substring(0, 18) + "..." : part.part_name,
      cost: currency === "USD" ? part.estimated_cost_INR / 95.34 : part.estimated_cost_INR,
      action: part.action_required,
    }));

  const selectedIndex = chartData.findIndex((entry) => entry.name === selectedPart);

  // Start editing a part
  const startEditing = (index: number, part: DamageDetail) => {
    setEditingIndex(index);
    setEditPartName(part.part_name);
    setEditDesc(part.damage_description);
    setEditAction(part.action_required);
    setEditCost(part.estimated_cost_INR);
    setEditPercentage(part.damage_percentage || 0);
  };

  // Save the edited part
  const saveEdit = (index: number) => {
    const updatedDetails = [...assessment.damage_details];
    const percentage = Number(editPercentage) || 0;
    const action = getRecommendedAction(editPartName, percentage, editDesc);
    updatedDetails[index] = {
      part_name: editPartName.trim() || "Unnamed Component",
      damage_description: editDesc.trim() || "No description provided.",
      action_required: action,
      estimated_cost_INR: Number(editCost) || 0,
      damage_percentage: percentage,
    };

    const newTotal = updatedDetails.reduce((sum, item) => sum + item.estimated_cost_INR, 0);

    onUpdateAssessment({
      ...assessment,
      damage_details: updatedDetails,
      total_estimated_cost_INR: newTotal,
    });
    setEditingIndex(null);
  };

  // Delete a part from the estimate
  const deletePart = (index: number) => {
    const updatedDetails = assessment.damage_details.filter((_, i) => i !== index);
    const newTotal = updatedDetails.reduce((sum, item) => sum + item.estimated_cost_INR, 0);

    onUpdateAssessment({
      ...assessment,
      damage_details: updatedDetails,
      total_estimated_cost_INR: newTotal,
    });

    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // Add a new manual part
  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const costNum = Number(newCost) || 0;
    const percentage = Number(newPercentage) || 0;
    const action = getRecommendedAction(newPartName, percentage, newDesc);
    const newPart: DamageDetail = {
      part_name: newPartName.trim(),
      damage_description: newDesc.trim() || "Manually added repair item.",
      action_required: action,
      estimated_cost_INR: costNum,
      damage_percentage: percentage,
    };

    const updatedDetails = [...assessment.damage_details, newPart];
    const newTotal = updatedDetails.reduce((sum, item) => sum + item.estimated_cost_INR, 0);

    onUpdateAssessment({
      ...assessment,
      damage_details: updatedDetails,
      total_estimated_cost_INR: newTotal,
    });

    // Reset Form
    setNewPartName("");
    setNewDesc("");
    setNewAction("Repair");
    setNewCost("");
    setNewPercentage("10");
    setShowAddForm(false);
  };

  // Stable claim ID to prevent rerendering jitter
  const claimIdSuffix = React.useMemo(() => {
    return Math.floor(100000 + Math.random() * 900000);
  }, [assessment]);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Download high-fidelity PDF invoice using html2canvas and jsPDF
  const downloadPDF = async () => {
    // We backup and temporarily patch computed style color getters to convert OKLCH to standard RGB values.
    // This cleanly keeps the html2canvas internal parser happy and prevents any crash on OKLCH colors.
    const originalGetComputedStyle = window.getComputedStyle;

    try {
      setIsGeneratingPDF(true);

      window.getComputedStyle = function (el, pseudoEl) {
        const style = originalGetComputedStyle(el, pseudoEl);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return function (propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                return replaceOklchInString(val);
              };
            }
            const val = Reflect.get(target, prop);
            if (typeof val === "string") {
              return replaceOklchInString(val);
            }
            if (typeof val === "function") {
              return val.bind(target);
            }
            return val;
          }
        });
      };
      
      // Select the target element. If we're currently in print preview, use printable-area. 
      // Otherwise, use our dedicated off-screen high fidelity container.
      const element = document.getElementById("printable-area") || document.getElementById("printable-invoice-content");
      
      if (!element) {
        console.error("PDF source element not found");
        setIsGeneratingPDF(false);
        return;
      }

      // Generate a high-resolution canvas screenshot
      const canvas = await html2canvas(element, {
        scale: 2, // Scale factor 2 for crisp vector typography
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Replace all oklch(...) inside all <style> tags in the cloned document
          const styles = clonedDoc.getElementsByTagName("style");
          for (let i = 0; i < styles.length; i++) {
            const style = styles[i];
            if (style.textContent && style.textContent.includes("oklch")) {
              style.textContent = replaceOklchInString(style.textContent);
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Configure elegant margins (15mm)
      const margin = 15;
      const contentWidth = pdfWidth - (margin * 2);
      
      // Calculate scaled height matching aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const contentHeight = contentWidth / ratio;

      // Draw compiled screenshot into the page canvas
      pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, contentHeight);

      // Clean file naming conventions
      const sanitizedModel = (assessment.car_model_identified || "vehicle")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      pdf.save(`autoguard-estimate-${sanitizedModel}.pdf`);
    } catch (err) {
      console.error("Failed to compile or save PDF report:", err);
    } finally {
      // Always restore original methods to prevent any leaks/unintended behavior outside the PDF process
      window.getComputedStyle = originalGetComputedStyle;
      setIsGeneratingPDF(false);
    }
  };

  // Trigger browser print
  const triggerPrint = () => {
    window.print();
  };

  const renderInvoiceBody = (isPDF = false) => {
    // Color configuration to bypass oklch parsing limitations in html2canvas
    const pdfColors = {
      slate950: "#020617",
      slate900: "#0f172a",
      slate700: "#334155",
      slate600: "#475569",
      slate500: "#64748b",
      slate400: "#94a3b8",
      slate300: "#cbd5e1",
      slate200: "#e2e8f0",
      slate50: "#f8fafc",
      white: "#ffffff",
      amber500: "#b45309",
      amber50: "#fffbeb",
      rose800: "#9f1239",
      rose100: "#ffe4e6",
      emerald800: "#065f46",
      emerald100: "#d1fae5",
      sky800: "#0369a1",
      sky100: "#e0f2fe"
    };

    const getStyle = (color?: string, bg?: string, border?: string) => {
      if (!isPDF) return undefined;
      const style: React.CSSProperties = {};
      if (color) style.color = color;
      if (bg) style.backgroundColor = bg;
      if (border) {
        style.borderColor = border;
        style.borderStyle = "solid";
      }
      return style;
    };

    const getBadgeStyle = (severity: string) => {
      if (!isPDF) return undefined;
      if (severity === "Severe") {
        return { backgroundColor: pdfColors.rose100, color: pdfColors.rose800 };
      } else if (severity === "Moderate") {
        return { backgroundColor: pdfColors.amber50, color: pdfColors.amber500 };
      } else {
        return { backgroundColor: pdfColors.emerald100, color: pdfColors.emerald800 };
      }
    };

    const getPartBadgeStyle = (action: string) => {
      if (!isPDF) return undefined;
      if (action === "Replace") {
        return { backgroundColor: pdfColors.rose100, color: pdfColors.rose800 };
      } else {
        return { backgroundColor: pdfColors.sky100, color: pdfColors.sky800 };
      }
    };

    return (
      <div 
        className={`bg-white text-slate-950 rounded-lg ${isPDF ? "p-2 border-0" : "p-4 border-2 border-slate-950"}`}
        style={getStyle(pdfColors.slate950, pdfColors.white)}
      >
        <div 
          className="flex justify-between items-start border-b-2 border-slate-950 pb-6"
          style={getStyle(undefined, undefined, pdfColors.slate950)}
        >
          <div>
            <div 
              className="flex items-center gap-1.5 text-2xl font-bold tracking-tight text-slate-950"
              style={getStyle(pdfColors.slate950)}
            >
              <Wrench className="w-6 h-6" /> AutoGuard Estimates Ltd.
            </div>
            <p 
              className="text-xs text-slate-500 mt-1"
              style={getStyle(pdfColors.slate500)}
            >
              Insurance-Compliant Cognitive Damage Appraisal<br />
              Vasant Kunj Diagnostic Hub, Sector C, New Delhi, India
            </p>
          </div>
          <div className="text-right">
            <h2 
              className="text-xl font-extrabold uppercase tracking-widest text-slate-700"
              style={getStyle(pdfColors.slate700)}
            >
              Insurance Estimate</h2>
            <p 
              className="text-sm font-semibold text-slate-950 mt-1 font-mono"
              style={getStyle(pdfColors.slate950)}
            >
              CLAIM-ID: AG-{claimIdSuffix}
            </p>
            <p 
              className="text-xs text-slate-500 font-mono mt-0.5"
              style={getStyle(pdfColors.slate500)}
            >
              Date Generated: {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 my-6 text-xs sm:text-sm">
          <div 
            className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between"
            style={getStyle(undefined, pdfColors.slate50, pdfColors.slate200)}
          >
            <div>
              <span 
                className="text-xs text-slate-400 font-mono block uppercase"
                style={getStyle(pdfColors.slate400)}
              >
                Vehicle Profile
              </span>
              <strong 
                className="text-sm text-slate-950 mt-1 block"
                style={getStyle(pdfColors.slate950)}
              >
                {assessment.car_model_identified}
              </strong>
            </div>
            <span 
              className="text-[10px] sm:text-xs text-slate-500 mt-2 block"
              style={getStyle(pdfColors.slate500)}
            >
              Segment: {assessment.vehicle_segment || "Mid-size Sedan"}
            </span>
          </div>

          <div 
            className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between"
            style={getStyle(undefined, pdfColors.slate50, pdfColors.slate200)}
          >
            <div>
              <span 
                className="text-xs text-slate-400 font-mono block uppercase"
                style={getStyle(pdfColors.slate400)}
              >
                Customer Profile
              </span>
              <strong 
                className="text-sm text-slate-950 mt-1 block"
                style={getStyle(pdfColors.slate950)}
              >
                {customerName || "N/A"}
              </strong>
            </div>
            <div 
              className="text-[10px] sm:text-xs text-slate-500 mt-2 block space-y-0.5"
              style={getStyle(pdfColors.slate500)}
            >
              <div>Phone: {customerPhone || "N/A"}</div>
              <div className="truncate">Addr: {customerAddress || "N/A"}</div>
            </div>
          </div>

          <div 
            className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between"
            style={getStyle(undefined, pdfColors.slate50, pdfColors.slate200)}
          >
            <div>
              <span 
                className="text-xs text-slate-400 font-mono block uppercase"
                style={getStyle(pdfColors.slate400)}
              >
                Cognitive Verdict
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${severityInfo.badge}`}
                  style={getBadgeStyle(assessment.overall_damage_severity)}
                >
                  {assessment.overall_damage_severity.toUpperCase()} DAMAGE
                </span>
              </div>
            </div>
            <span 
              className="text-[10px] sm:text-xs text-slate-400 font-mono mt-2 block uppercase"
              style={getStyle(pdfColors.slate400)}
            >
              Currency: {currency}
            </span>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-sm my-6">
          <thead>
            <tr 
              className="border-b-2 border-slate-950 text-slate-700"
              style={getStyle(pdfColors.slate700, undefined, pdfColors.slate950)}
            >
              <th className="py-2.5 font-bold uppercase text-xs">Sl.No</th>
              <th className="py-2.5 font-bold uppercase text-xs">Damaged Component</th>
              <th className="py-2.5 font-bold uppercase text-xs">Assessment & Description</th>
              <th className="py-2.5 font-bold uppercase text-xs">Action</th>
              <th className="py-2.5 font-bold uppercase text-xs text-right">Est. Cost ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {assessment.damage_details.map((part, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-200"
                style={getStyle(undefined, undefined, pdfColors.slate200)}
              >
                <td 
                  className="py-3 font-mono text-slate-500"
                  style={getStyle(pdfColors.slate500)}
                >
                  {index + 1}
                </td>
                <td 
                  className="py-3 font-bold text-slate-950"
                  style={getStyle(pdfColors.slate950)}
                >
                  {part.part_name}
                </td>
                <td 
                  className="py-3 text-slate-600 text-xs max-w-xs"
                  style={getStyle(pdfColors.slate600)}
                >
                  {part.damage_description}
                </td>
                <td className="py-3">
                  <span 
                    className={`px-2 py-0.5 rounded text-xs font-semibold uppercase font-mono ${
                      part.action_required === "Replace" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"
                    }`}
                    style={getPartBadgeStyle(part.action_required)}
                  >
                    {part.action_required}
                  </span>
                </td>
                <td 
                  className="py-3 text-right font-semibold text-slate-950 font-mono"
                  style={getStyle(pdfColors.slate950)}
                >
                  {formatCurrency(part.estimated_cost_INR)}
                </td>
              </tr>
            ))}
            {assessment.damage_details.length === 0 && (
              <tr>
                <td 
                  colSpan={5} 
                  className="py-6 text-center text-slate-400 italic"
                  style={getStyle(pdfColors.slate400)}
                >
                  No damaged parts specified on this estimate sheet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div 
          className="flex justify-end mt-8 border-t-2 border-slate-950 pt-4"
          style={getStyle(undefined, undefined, pdfColors.slate950)}
        >
          <div className="text-right max-w-sm">
            <span 
              className="text-xs text-slate-500 font-mono uppercase"
              style={getStyle(pdfColors.slate500)}
            >
              Grand Insurance Estimate Total
            </span>
            <div 
              className="text-3xl font-extrabold text-slate-950 mt-1 font-mono"
              style={getStyle(pdfColors.slate950)}
            >
              {formatCurrency(assessment.total_estimated_cost_INR)}
            </div>
            <p 
              className="text-xs text-slate-400 mt-1"
              style={getStyle(pdfColors.slate400)}
            >
              Includes diagnostic scans, paint booth processes, component costs, and mechanic garage installation labor charges.
            </p>
          </div>
        </div>

        <div 
          className="mt-12 grid grid-cols-2 gap-8 text-xs text-slate-400 border-t border-slate-200 pt-6"
          style={getStyle(undefined, undefined, pdfColors.slate200)}
        >
          <div>
            <h4 
              className="font-bold text-slate-700 uppercase tracking-widest text-[10px]"
              style={getStyle(pdfColors.slate700)}
            >
              Claims & Liability Notice
            </h4>
            <p 
              className="mt-1 leading-relaxed"
              style={getStyle(pdfColors.slate400)}
            >
              This estimation draft is powered by AI computer vision analysis and is intended as a baseline claim report. Final workshop costs may vary based on structural inspection at physical body shop garages.
            </p>
          </div>
          <div className="text-right flex flex-col justify-end items-end gap-3">
            <div 
              className="border-b border-slate-300 w-48 h-10"
              style={getStyle(undefined, undefined, pdfColors.slate300)}
            ></div>
            <span 
              className="font-mono text-[10px] uppercase text-slate-500 tracking-wider"
              style={getStyle(pdfColors.slate500)}
            >
              Authorized Insurance Signatory
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (isPrintFriendly) {
    return (
      <div className="bg-white text-slate-950 p-8 max-w-4xl mx-auto border border-slate-300 rounded shadow-sm font-sans" id="printable-area">
        {/* Print Header Controls */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4 no-print gap-4 flex-wrap">
          <span className="text-sm font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Print Preview Mode: Use standard printer settings.
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPrintFriendly(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Exit Preview
            </button>
            <button 
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/60 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition shadow disabled:cursor-not-allowed cursor-pointer"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" /> Download PDF
                </>
              )}
            </button>
            <button 
              onClick={triggerPrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Estimate
            </button>
          </div>
        </div>

        {/* Invoice Body Container */}
        {renderInvoiceBody(false)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Side-by-Side: Claim Estimates & Repair Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Claim Estimates (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Car Model card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex-1">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Identified Vehicle</span>
              <strong className="text-lg text-slate-900 dark:text-white mt-0.5 block truncate">{assessment.car_model_identified}</strong>
              <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-lg font-mono">
                  {assessment.vehicle_segment || "Mid-size Sedan"}
                </span>
                <button 
                  onClick={() => setShowMatrix(!showMatrix)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline font-semibold transition tracking-wide cursor-pointer uppercase"
                >
                  {showMatrix ? "Hide Matrix" : "View Standards"}
                </button>
              </div>
            </div>
          </div>

          {/* Severity card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex-1">
            <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 ${severityInfo.iconColor}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Overall Severity</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wider ${severityInfo.badge}`}>
                  {assessment.overall_damage_severity.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight mt-1.5">{severityInfo.desc}</p>
            </div>
          </div>

          {/* Total Cost card */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex-1">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
            <div className="w-full">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Insurance Claim Estimate</span>
              <strong className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-850 to-blue-600 dark:from-white dark:via-slate-100 dark:to-blue-400 font-mono mt-0.5 block">
                {formatCurrency(assessment.total_estimated_cost_INR)}
              </strong>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span>Includes labor, paint & tax ({currency === "USD" ? "$" : "₹"})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Repair Cost Distribution Chart (col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Repair Cost Distribution
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Component breakdown of repair/replace costs.</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                <span className="text-slate-300 font-medium">Repair ({currency === "USD" ? "$" : "₹"})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                <span className="text-slate-300 font-medium">Replace ({currency === "USD" ? "$" : "₹"})</span>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (() => {
            const rowHeight = chartData.length > 0 ? Math.max(220, chartData.length * 45) / chartData.length : 45;
            return (
              <div className="w-full pt-2 relative">
                <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 45)}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke={isDark ? "#475569" : "#64748b"} 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => currency === "USD" ? `$${Math.round(val).toLocaleString("en-US")}` : `₹${Math.round(val).toLocaleString("en-IN")}`}
                    />
                    <YAxis 
                      dataKey="displayName" 
                      type="category" 
                      stroke={isDark ? "#94a3b8" : "#475569"} 
                      fontSize={11} 
                      fontWeight="600"
                      width={130}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9', radius: 8 }} />
                    <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={22}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.action === "Replace" ? "#f43f5e" : "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })() : (
            <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <p className="text-slate-400 text-xs italic">No data available to visualize. Add parts to generate the chart.</p>
            </div>
          )}
        </div>

      </div>

      {/* Indian Market Rate Standards lookup matrix panel */}
      {showMatrix && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl transition duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Valuation Standards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
                  <FileCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Deterministic Valuation Standards (INR)
                </h4>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  Zero-Variance Policy
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All visible damages are classified using strictly fixed segment rate standards. Individual repair and replacement components are scaled proportionally to meet the overall model estimate standard.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/50">
                      <th className="py-2 px-3">Vehicle Segment</th>
                      <th className="py-2 px-3 text-right">Minor (&lt;5%)</th>
                      <th className="py-2 px-3 text-right">Moderate (5%-20%)</th>
                      <th className="py-2 px-3 text-right">Severe (&gt;20%)</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-slate-600 dark:text-slate-300">
                    <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${(assessment.vehicle_segment || "Mid-size Sedan") === "Mid-size Sedan" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : ""}`}>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">Mid-size Sedan</td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">₹4,700</td>
                      <td className="py-2 px-3 text-right">₹9,500</td>
                      <td className="py-2 px-3 text-right">₹18,000</td>
                    </tr>
                    <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${(assessment.vehicle_segment || "Mid-size Sedan") === "SUV / Crossover" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : ""}`}>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">SUV / Crossover</td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">₹5,500</td>
                      <td className="py-2 px-3 text-right">₹8,350</td>
                      <td className="py-2 px-3 text-right">₹22,000</td>
                    </tr>
                    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${(assessment.vehicle_segment || "Mid-size Sedan") === "Hatchback" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : ""}`}>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">Hatchback</td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">₹3,500</td>
                      <td className="py-2 px-3 text-right">₹7,000</td>
                      <td className="py-2 px-3 text-right">₹14,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 2: Insurance Threshold Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Award className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  Appraisal Threshold Matrix (Repair vs. Replace)
                </h4>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  Insurance Standards
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Component-based thresholds for deciding between cost-efficient <strong>Repair</strong> or premium safety-focused OEM <strong>Replacement</strong>.
              </p>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Plastic Parts (Bumper, Grille, Mirrors, Lights):</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">&gt;15% damage or any visible clip/crack fracture triggers mandatory replacement to preserve safety sensors and aerodynamic structural fittings.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Metal Body Panels (Hood, Doors, Fenders, Tailgate):</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">&gt;30% damage or any deep crease (sharp metal fold) triggers replacement due to high-tensile metal fatigue. Under 30% without sharp creases is repaired.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Structural & Safety Parts (Pillars, Chassis, Apron, Impact Beams):</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">&gt;=5% minor damage or structural bending triggers a 100% mandatory replacement/panel cutting action to comply with crash-test safety regulations.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">70% Insurance Financial Rule:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">If the calculated repair cost (tinkering + paint labor) of any component reaches 70% or more of its new replacement cost, it is automatically upgraded to full OEM replacement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Information Card (Input Form) */}
      {!readOnly && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Customer Information</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Enter details to automatically include in print and PDF exports.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => onCustomerAddressChange(e.target.value)}
                placeholder="e.g. Sector 15, Dwarka, New Delhi"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main List of Damaged Parts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Damaged Parts Appraisal Checklist
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Toggle actions, adjust costs, or manually append parts to fine-tune the insurance draft.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!readOnly && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Add Part
              </button>
            )}
            {!readOnly && (
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              >
                <Share2 className="w-4 h-4" /> Share Appraisal
              </button>
            )}
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/60 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" /> Download PDF
                </>
              )}
            </button>
            <button
              onClick={() => setIsPrintFriendly(true)}
              className="bg-black hover:bg-zinc-900 dark:bg-black dark:hover:bg-zinc-900 text-white border border-zinc-800 dark:border-zinc-750 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Estimate
            </button>
          </div>
        </div>

        {/* Form to Add New Custom Part */}
        {showAddForm && (
          <form onSubmit={handleAddPart} className="bg-slate-50 p-6 border-b border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-500" /> Append New Component
              </span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Right Headlamp"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Damage Percentage (1-100%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="e.g. 25"
                  value={newPercentage}
                  onChange={(e) => setNewPercentage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Recommended Action</label>
                <select
                  disabled
                  value={newAction}
                  className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none cursor-not-allowed font-semibold transition"
                >
                  <option value="Repair">Repair</option>
                  <option value="Replace">Replace</option>
                </select>
                <span className="text-[10px] text-sky-600 font-medium mt-1 block">Auto-set by threshold standards</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Est. Cost (INR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 3500"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Damage Description / Mechanic Notes</label>
              <textarea
                placeholder="Briefly explain the nature of visual scratches, dents, misalignment or fracture..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-200/50 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white px-4.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                Add Component
              </button>
            </div>
          </form>
        )}

        {/* List of Appraisal Items */}
        <div className="divide-y divide-slate-100">
          {assessment.damage_details.map((part, index) => {
            const isEditing = editingIndex === index;

            return (
              <div 
                key={index} 
                onClick={() => {
                  if (!isEditing && onSelectPart) {
                    onSelectPart(selectedPart === part.part_name ? null : part.part_name);
                  }
                }}
                className={`group p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none border-l-4 ${
                  isEditing 
                    ? "bg-sky-50/40 border-l-sky-500" 
                    : selectedPart === part.part_name
                    ? "bg-amber-500/10 dark:bg-amber-500/5 border-l-amber-500"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-l-transparent"
                }`}
              >
                {isEditing ? (
                  /* Active Editing Row Form */
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center border-b border-sky-100 pb-1.5 mb-1">
                      <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Editing Checklist Item #{index + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {index}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Component</label>
                        <input
                          type="text"
                          value={editPartName}
                          onChange={(e) => setEditPartName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Damage %</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editPercentage}
                          onChange={(e) => setEditPercentage(Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Action</label>
                        <select
                          disabled
                          value={editAction}
                          className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-not-allowed font-semibold"
                        >
                          <option value="Repair">Repair (Auto)</option>
                          <option value="Replace">Replace (Auto)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Cost (INR)</label>
                        <input
                          type="number"
                          min="0"
                          value={editCost}
                          onChange={(e) => setEditCost(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Damage Details</label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500"
                        placeholder="Damage description..."
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1.5 border-t border-sky-100/50 mt-1">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-200/50 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(index)}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard List Row */
                  <>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-black transition-colors duration-200 text-sm md:text-base">
                          {part.part_name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                          part.action_required === "Replace" 
                            ? "bg-rose-50 border border-rose-100 text-rose-700" 
                            : "bg-sky-50 border border-sky-100 text-sky-700"
                        }`}>
                          {part.action_required}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          {part.damage_percentage !== undefined ? part.damage_percentage : getFallbackPercentage(part.part_name, part.action_required)}% Damage
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm pl-0 md:pl-7 leading-relaxed">
                        {part.damage_description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 self-start md:self-auto pl-0 md:pl-7 mt-2 md:mt-0">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Est. Cost</span>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-slate-950 dark:group-hover:text-black transition-colors duration-200 font-mono text-sm md:text-base">
                          {formatCurrency(part.estimated_cost_INR)}
                        </span>
                      </div>
                      
                      {/* Interactive Controls */}
                      {!readOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(index, part);
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition"
                            title="Edit Part Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePart(index);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                            title="Remove Component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {assessment.damage_details.length === 0 && (
            <div className="p-10 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm italic">All parts have been repaired or removed. Click "Add Part" to insert custom estimate components.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nearest Certified Repair Workshops Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Certified Repair Workshops in India
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Locate cashless certified multi-brand garages for high-fidelity paint matching, structural restoration, and denting.</p>
          </div>
          
          {/* Search controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Enter 6-digit PIN..."
                value={pinCodeOrCity}
                onChange={(e) => setPinCodeOrCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchManual(pinCodeOrCity);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs focus:outline-none transition font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-mono"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSearchManual(pinCodeOrCity)}
                disabled={workshopLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-55 text-white font-bold py-2 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)] flex items-center gap-1"
              >
                {workshopLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Search</span>
              </button>
              
              <button
                type="button"
                onClick={handleAutoGeolocate}
                disabled={geoLoading || workshopLoading}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Use Geolocation API to auto-detect nearest"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 dark:text-blue-400" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Locate className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>Auto-Detect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Geolocation feedback & errors */}
        {geoError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{geoError}</span>
          </div>
        )}

        {userLocation && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between gap-2 animate-fadeIn font-medium">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Location successfully geolocated: <strong className="font-mono">{userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">GPS Active</span>
          </div>
        )}

        {/* Resolved Postal Information Header */}
        {resolvedPostalInfo && !workshopSearchError && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 rounded-2xl flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300 animate-fadeIn font-medium">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Pincode Resolved Area: <strong className="font-bold text-slate-900 dark:text-white">{resolvedPostalInfo.postOffice}</strong>, {resolvedPostalInfo.district}, {resolvedPostalInfo.state}
            </span>
          </div>
        )}

        {/* Dynamic Display Area: Loading vs. Error vs. Bento Grid Cards */}
        {workshopLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Retrieving certified workshop parameters...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Resolving pincode from Indian Postal Service database</p>
            </div>
          </div>
        ) : workshopSearchError ? (
          <div className="p-8 text-center space-y-4 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl animate-fadeIn max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">No certified workshops found</h4>
              <p className="text-xs text-rose-800 dark:text-rose-400 font-medium leading-relaxed">
                {workshopSearchError}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {nearbyWorkshops.map((ws) => (
              <div 
                key={ws.id} 
                className="bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 border border-slate-200 dark:border-slate-850 hover:border-blue-500/50 rounded-3xl p-5 flex flex-col justify-between gap-4 transition duration-300 shadow-sm hover:shadow relative group overflow-hidden"
              >
                {/* Top highlights */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-extrabold uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400">
                          Certified
                        </span>
                        {ws.distance !== undefined && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5 fill-emerald-600 dark:fill-emerald-400 rotate-45" />
                            {ws.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-150 leading-snug pt-1">
                        {ws.name}
                      </h4>
                    </div>
                    
                    {/* Rating badge */}
                    <div className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>{ws.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {ws.address}
                  </p>

                  <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <Award className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span className="text-[11px] font-semibold">{ws.certifiedBrand}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Wrench className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">{ws.specialty}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <a 
                    href={`tel:${ws.phone.replace(/\s+/g, "")}`}
                    className="flex-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Call</span>
                  </a>
                  
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ws.name + " " + ws.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 px-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  >
                    <Map className="w-3.5 h-3.5 text-white" />
                    <span>Map</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset button bar */}
      {!readOnly && (
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl">
          <span className="text-xs text-slate-400">Estimates strictly aligned with typical North/South India garage labor rates.</span>
          <button
            onClick={onReset}
            className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start New Diagnosis
          </button>
        </div>
      )}

      {/* Dynamic Deep-Link Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={() => {
                setShowShareModal(false);
                setShareUrl("");
                setCopied(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Generate Adjuster Link</h3>
                <p className="text-slate-500 text-[11px]">Generate a temporary, remote audit portal link.</p>
              </div>
            </div>

            {!shareUrl ? (
              <div className="space-y-4">
                <p className="text-slate-600 text-xs leading-relaxed">
                  This generates a secure, read-only remote review deep-link containing all active photo analyses, customized component checklists, and interactive cost distribution models.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">Link Expiration Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "15 Minutes", val: 15 },
                      { label: "1 Hour", val: 60 },
                      { label: "24 Hours", val: 1440 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setExpiryMinutes(opt.val)}
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                          expiryMinutes === opt.val
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800/60 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Secure Voucher...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" /> Create Secure Deep-Link
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure Adjuster deep-link generated successfully!</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Review Portal URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono select-all focus:outline-none focus:border-slate-300"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-4 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 animate-pulse" />
                  <span>
                    This deep-link expires on{" "}
                    <strong>
                      {new Date(Date.now() + expiryMinutes * 60000).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                      ({expiryMinutes >= 1440 ? "tomorrow" : "today"})
                    </strong>.
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareUrl("");
                      setCopied(false);
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    Test Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden high-fidelity container used solely for PDF capture */}
      <div 
        id="printable-invoice-content" 
        className="absolute left-[-9999px] top-0 w-[800px] bg-white p-8 rounded"
        style={{ pointerEvents: 'none' }}
      >
        {renderInvoiceBody(true)}
      </div>
    </div>
  );
}
