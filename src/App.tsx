import React, { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import DamageSummaryReport from "./components/DamageSummaryReport";
import DamageVisualOverlay from "./components/DamageVisualOverlay";
import InventoryPricingEditor from "./components/InventoryPricingEditor";
import { UserProtectedRoute, OwnerProtectedRoute } from "./components/ProtectedRoute";
import { SAMPLE_CARS } from "./data";
import { DamageAssessment, SampleCar, SavedAppraisal } from "./types";
import { overrideAssessmentWithPricing } from "./utils/pricingEngine";
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Cpu, 
  Sparkles, 
  Info, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  FileCheck,
  History,
  Camera,
  Loader2,
  Database,
  Plus,
  RotateCcw,
  Edit2,
  Save,
  X,
  TrendingUp,
  Coins,
  LogOut,
  User,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  FileSignature,
  Clock
} from "lucide-react";

// Helper function to compress and resize custom base64 images for lightweight localStorage storage
const shrinkForStorage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith("data:image")) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const targetWidth = 350;
      const scale = targetWidth / img.width;
      const targetHeight = img.height * scale;
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};

const partPolygons: Record<string, string[]> = {
  hood: ["20,35 80,35 88,58 50,65 12,58"],
  bumper: ["10,60 90,60 88,82 50,90 12,82"],
  headlight: [
    "72,52 86,54 84,65 70,61", // Right headlight
    "14,54 28,52 30,61 16,65"  // Left headlight
  ],
  grille: ["32,55 68,55 66,72 34,72"],
  windshield: ["28,15 72,15 80,35 20,35"],
  fender: ["5,45 18,43 22,60 8,62"],
  door: ["15,40 48,40 48,70 18,68"]
};

const getPolygonsForPart = (partName: string | null): string[] => {
  if (!partName) return [];
  const name = partName.toLowerCase();
  if (name.includes("hood")) return partPolygons.hood;
  if (name.includes("bumper")) return partPolygons.bumper;
  if (name.includes("headlight") || name.includes("headlamp")) return partPolygons.headlight;
  if (name.includes("grille") || name.includes("radiator")) return partPolygons.grille;
  if (name.includes("windshield") || name.includes("glass")) return partPolygons.windshield;
  if (name.includes("fender")) return partPolygons.fender;
  if (name.includes("door")) return partPolygons.door;
  return [];
};

const DEFAULT_BASELINE_PRICING = {
  "Mid-size Sedan": {
    "Window Glass": { repair: 0, replace: 9500 },
    "Rear Bumper Panel": { repair: 4500, replace: 9000 },
    "Front Bumper": { repair: 5000, replace: 11000 },
    "Headlight": { repair: 1200, replace: 3500 },
    "Fender": { repair: 1800, replace: 4500 },
    "Side Door": { repair: 5400, replace: 12000 },
    "Side View Mirror": { repair: 1000, replace: 2800 },
    "Wiper Blades": { repair: 0, replace: 850 },
    "Grille": { repair: 1500, replace: 6000 },
    "Hood": { repair: 3500, replace: 14000 },
    "Reflector": { repair: 0, replace: 950 },
    "A-Pillar Trim": { repair: 2500, replace: 5000 }
  },
  "SUV / Crossover": {
    "Window Glass": { repair: 0, replace: 12000 },
    "Rear Bumper Panel": { repair: 5500, replace: 11000 },
    "Front Bumper": { repair: 6000, replace: 13500 },
    "Headlight": { repair: 1500, replace: 4800 },
    "Fender": { repair: 2200, replace: 5500 },
    "Side Door": { repair: 6500, replace: 15000 },
    "Side View Mirror": { repair: 1200, replace: 3500 },
    "Wiper Blades": { repair: 0, replace: 1000 },
    "Grille": { repair: 1800, replace: 8000 },
    "Hood": { repair: 4500, replace: 18000 },
    "Reflector": { repair: 0, replace: 1200 },
    "A-Pillar Trim": { repair: 3000, replace: 6000 }
  },
  "Hatchback": {
    "Window Glass": { repair: 0, replace: 7500 },
    "Rear Bumper Panel": { repair: 3500, replace: 7500 },
    "Front Bumper": { repair: 4000, replace: 8500 },
    "Headlight": { repair: 1000, replace: 2800 },
    "Fender": { repair: 1500, replace: 3500 },
    "Side Door": { repair: 4500, replace: 9500 },
    "Side View Mirror": { repair: 800, replace: 2200 },
    "Wiper Blades": { repair: 0, replace: 700 },
    "Grille": { repair: 1200, replace: 4500 },
    "Hood": { repair: 2800, replace: 10000 },
    "Reflector": { repair: 0, replace: 800 },
    "A-Pillar Trim": { repair: 2000, replace: 4000 }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"appraiser" | "pricelist">("appraiser");

  // --- ADJUSTER DEEP-LINK REVIEW STATES ---
  const [shareId, setShareId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("shareId");
    } catch {
      return null;
    }
  });

  const [sharedAppraisalData, setSharedAppraisalData] = useState<any | null>(null);
  const [isSharedLoading, setIsSharedLoading] = useState<boolean>(false);
  const [sharedError, setSharedError] = useState<string | null>(null);
  
  // Adjuster review inputs
  const [adjusterStatus, setAdjusterStatus] = useState<"approved" | "rejected" | "changes_requested" | "pending">("approved");
  const [adjusterNotes, setAdjusterNotes] = useState<string>("");
  const [adjusterSignature, setAdjusterSignature] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Fetch shared appraisal details if shareId is present
  useEffect(() => {
    if (shareId) {
      setIsSharedLoading(true);
      fetch(`/api/appraisal/share/${shareId}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.error || "Failed to load shared appraisal.");
            });
          }
          return res.json();
        })
        .then((data) => {
          setSharedAppraisalData(data.appraisal);
          if (data.appraisal.adjusterNotes) {
            setAdjusterNotes(data.appraisal.adjusterNotes);
          }
          if (data.appraisal.adjusterSignature) {
            setAdjusterSignature(data.appraisal.adjusterSignature);
          }
          if (data.appraisal.status !== "pending") {
            setAdjusterStatus(data.appraisal.status);
            setReviewSubmitted(true);
          } else {
            setAdjusterStatus("approved");
            setReviewSubmitted(false);
          }
        })
        .catch((err) => {
          console.error("Shared load error:", err);
          setSharedError(err.message || "The temporary deep-link has expired or does not exist.");
        })
        .finally(() => {
          setIsSharedLoading(false);
        });
    }
  }, [shareId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjusterSignature.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/appraisal/share/${shareId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: adjusterStatus,
          adjusterNotes,
          adjusterSignature
        })
      });
      const data = await res.json();
      if (data.success) {
        setSharedAppraisalData(data.appraisal);
        setReviewSubmitted(true);
      } else {
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting the review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // --- LAYER 1: APP-WIDE GENERAL USER & ADMIN SESSION ---
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem("autoguard_user_token") !== null ||
      localStorage.getItem("autoguard_auth_user") !== null ||
      localStorage.getItem("currentUser") !== null ||
      sessionStorage.getItem("autoguard_user_token") !== null ||
      sessionStorage.getItem("currentUser") !== null
    );
  });
  const [authUser, setAuthUser] = useState<{ email: string; role: string } | null>(() => {
    try {
      const savedLocal = localStorage.getItem("autoguard_auth_user");
      if (savedLocal) return JSON.parse(savedLocal);
      const savedSession = sessionStorage.getItem("autoguard_auth_user");
      if (savedSession) return JSON.parse(savedSession);
      const currentUserEmail = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
      if (currentUserEmail) {
        return { email: currentUserEmail, role: "Showroom Admin" };
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleUserLoginSuccess = (token: string, user: { email: string; role: string }) => {
    localStorage.setItem("autoguard_user_token", token);
    localStorage.setItem("autoguard_auth_user", JSON.stringify(user));
    localStorage.setItem("currentUser", user.email);
    sessionStorage.setItem("autoguard_user_token", token);
    sessionStorage.setItem("autoguard_auth_user", JSON.stringify(user));
    sessionStorage.setItem("currentUser", user.email);
    setIsUserAuthenticated(true);
    setAuthUser(user);
  };

  const handleUserLogout = () => {
    localStorage.removeItem("autoguard_user_token");
    localStorage.removeItem("autoguard_auth_user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("autoguard_owner_token");
    localStorage.removeItem("autoguard_admin_user");
    sessionStorage.removeItem("autoguard_user_token");
    sessionStorage.removeItem("autoguard_auth_user");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("autoguard_owner_token");
    sessionStorage.removeItem("autoguard_admin_user");
    setIsUserAuthenticated(false);
    setAuthUser(null);
    setIsOwnerAuthenticated(false);
    setAdminUser(null);
    setActiveTab("appraiser");
  };

  // --- LAYER 2: OWNER/ADMIN CENTRAL SESSION ---
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("autoguard_owner_token") !== null;
  });
  const [adminUser, setAdminUser] = useState<{ email: string; role: string; shopName: string } | null>(() => {
    try {
      const saved = localStorage.getItem("autoguard_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleOwnerLoginSuccess = (token: string, user: { email: string; role: string; shopName: string }) => {
    localStorage.setItem("autoguard_owner_token", token);
    localStorage.setItem("autoguard_admin_user", JSON.stringify(user));
    setIsOwnerAuthenticated(true);
    setAdminUser(user);
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem("autoguard_owner_token");
    localStorage.removeItem("autoguard_admin_user");
    sessionStorage.removeItem("autoguard_owner_token");
    sessionStorage.removeItem("autoguard_admin_user");
    setIsOwnerAuthenticated(false);
    setAdminUser(null);
  };
  
  const [shopOwnerPricing, setShopOwnerPricing] = useState<Record<string, Record<string, { repair: number; replace: number }>>>(() => {
    try {
      const savedUser = localStorage.getItem("autoguard_auth_user") || sessionStorage.getItem("autoguard_auth_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const key = user ? `pricing_list_${user.email.split('@')[0]}` : "pricing_list_default";
        const saved = localStorage.getItem(key);
        if (saved) {
          return JSON.parse(saved);
        }
      } else {
        const currentUserEmail = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (currentUserEmail) {
          const key = `pricing_list_${currentUserEmail.split('@')[0]}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            return JSON.parse(saved);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load custom pricing on init, using defaults:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_BASELINE_PRICING));
  });

  const [selectedSample, setSelectedSample] = useState<SampleCar | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [damageCategory, setDamageCategory] = useState<string | null>(null);
  
  // Currency selection state (INR / USD) with static 1 USD = 95.34 INR conversion rate
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const formatHistoryCost = (costINR: number) => {
    return currency === "USD"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(costINR / 95.34)
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(costINR);
  };
  
  // Recent Appraisals tracking and states
  const [activeAppraisalId, setActiveAppraisalId] = useState<string | null>(null);
  const [recentAppraisals, setRecentAppraisals] = useState<SavedAppraisal[]>([]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("autoguard_appraisals");
      if (saved) {
        setRecentAppraisals(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load recent appraisals from localStorage:", e);
    }
  }, []);
  
  // Assessment and state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<DamageAssessment | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>("Hood");

  // Customer details states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const loadedEmailRef = useRef<string | undefined>(undefined);

  // Synchronize/load pricing and clear session UI states dynamically on login/logout/switch
  React.useEffect(() => {
    // 1. Instantly clear the old session's UI state
    setCurrentAssessment(null);
    setSelectedSample(null);
    setCustomImage(null);
    setSelectedPart(null);
    setDamageCategory(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setActiveAppraisalId(null);

    // 2. Fetch/Load only the specific component rates assigned to that specific authenticated email profile
    const key = authUser ? `pricing_list_${authUser.email.split('@')[0]}` : "pricing_list_default";
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setShopOwnerPricing(JSON.parse(saved));
      } else {
        // If brand-new user logs in for the first time, initialize with baseline
        setShopOwnerPricing(JSON.parse(JSON.stringify(DEFAULT_BASELINE_PRICING)));
      }
    } catch (e) {
      console.warn("Could not load user pricing on user change:", e);
      setShopOwnerPricing(JSON.parse(JSON.stringify(DEFAULT_BASELINE_PRICING)));
    }

    // Set the loaded email reference to permit saving subsequent edits
    loadedEmailRef.current = authUser?.email;
  }, [authUser]);

  // Save edits of pricing to local storage under the correct user key
  React.useEffect(() => {
    if (loadedEmailRef.current !== authUser?.email) {
      // Prevent stale pricing from being saved under a newly logged-in/switched user
      return;
    }
    const key = authUser ? `pricing_list_${authUser.email.split('@')[0]}` : "pricing_list_default";
    localStorage.setItem(key, JSON.stringify(shopOwnerPricing));
  }, [shopOwnerPricing, authUser]);

  // Sync customer details changes to the active saved appraisal in history
  React.useEffect(() => {
    if (activeAppraisalId) {
      setRecentAppraisals((prev) => {
        const itemToSync = prev.find((item) => item.id === activeAppraisalId);
        if (
          itemToSync &&
          (itemToSync.customerName !== customerName ||
            itemToSync.customerPhone !== customerPhone ||
            itemToSync.customerAddress !== customerAddress)
        ) {
          const updatedHistory = prev.map((item) => {
            if (item.id === activeAppraisalId) {
              return {
                ...item,
                customerName,
                customerPhone,
                customerAddress,
              };
            }
            return item;
          });
          localStorage.setItem("autoguard_appraisals", JSON.stringify(updatedHistory));
          return updatedHistory;
        }
        return prev;
      });
    }
  }, [customerName, customerPhone, customerAddress, activeAppraisalId]);

  // Set default selected part on assessment load
  React.useEffect(() => {
    if (currentAssessment) {
      const hasHood = currentAssessment.damage_details.some(d => d.part_name.toLowerCase().includes("hood"));
      if (hasHood) {
        // Find the exact name
        const hoodPart = currentAssessment.damage_details.find(d => d.part_name.toLowerCase().includes("hood"));
        setSelectedPart(hoodPart?.part_name || "Hood");
      } else if (currentAssessment.damage_details.length > 0) {
        setSelectedPart(currentAssessment.damage_details[0].part_name);
      } else {
        setSelectedPart(null);
      }
    } else {
      setSelectedPart(null);
    }
  }, [currentAssessment]);

  // Keep the current assessment in sync with pricing matrix updates safely using primitive values
  const currentTotal = currentAssessment?.total_estimated_cost_INR || 0;
  React.useEffect(() => {
    if (currentAssessment) {
      const updated = overrideAssessmentWithPricing(currentAssessment, shopOwnerPricing);
      if (updated.total_estimated_cost_INR !== currentAssessment.total_estimated_cost_INR) {
        setCurrentAssessment(updated);
      }
    }
  }, [shopOwnerPricing, currentTotal]);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async (deviceId?: string) => {
    setIsCameraActive(true);
    setCameraError(null);
    setSelectedSample(null);
    setCustomImage(null);
    setCurrentAssessment(null);
    setAnalysisError(null);
    
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      
      // Small timeout to ensure video element is rendered and bound correctly
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameraDevices(videoDevices);
      
      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeSettings = activeTrack ? activeTrack.getSettings() : null;
        const activeDeviceId = activeSettings?.deviceId || videoDevices[0].deviceId;
        setSelectedDeviceId(activeDeviceId);
      } else if (deviceId) {
        setSelectedDeviceId(deviceId);
      }
    } catch (err: any) {
      // Use console.warn/log to prevent triggering test environment console.error failures for expected user actions/dismissals
      console.warn("Webcam permission/access info:", err?.message || err);
      const isPermissionDenied = 
        err?.name === "NotAllowedError" || 
        err?.name === "PermissionDeniedError" || 
        String(err).includes("Permission dismissed") || 
        String(err?.message).includes("Permission dismissed");

      if (isPermissionDenied) {
        setCameraError("Camera access was dismissed or denied. Please allow camera permissions in your browser settings, or drag/browse your file instead.");
      } else {
        setCameraError("Unable to access camera. Please verify your webcam is connected.");
      }
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      try {
        setFileName("webcam_snapshot.jpg");
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Downscale and compress
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = canvas.width;
          let height = canvas.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const compressedCanvas = document.createElement("canvas");
          compressedCanvas.width = width;
          compressedCanvas.height = height;
          const compressedCtx = compressedCanvas.getContext("2d");
          if (compressedCtx) {
            compressedCtx.drawImage(canvas, 0, 0, width, height);
            const compressedBase64 = compressedCanvas.toDataURL("image/jpeg", 0.85);
            setCustomImage(compressedBase64);
            setMimeType("image/jpeg");
          } else {
            const rawBase64 = canvas.toDataURL("image/jpeg", 0.85);
            setCustomImage(rawBase64);
            setMimeType("image/jpeg");
          }
          
          stopCamera();
        }
      } catch (err) {
        console.error("Failed to capture snapshot:", err);
        setAnalysisError("Failed to capture photo from webcam.");
      }
    }
  };

  // Read file and set base64 with downscaling/compression to prevent timeout errors
  const handleFile = (file: File) => {
    setFileName(file.name);
    if (!file.type.startsWith("image/")) {
      setAnalysisError("Invalid file type. Please upload a vehicle image (PNG, JPG, WEBP).");
      return;
    }
    
    setAnalysisError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Limit max dimensions to 1200px to keep payload size optimal
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG with 0.8 quality to minimize payload size and improve API reliability
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          setCustomImage(compressedBase64);
          setMimeType("image/jpeg");
        } else {
          // Fallback to original if context creation fails
          setCustomImage(event.target?.result as string);
          setMimeType(file.type);
        }
        setSelectedSample(null); // deselect sample
        setCurrentAssessment(null); // clear old report
      };
      img.onerror = () => {
        // Fallback to original if image load fails
        setCustomImage(event.target?.result as string);
        setMimeType(file.type);
        setSelectedSample(null);
        setCurrentAssessment(null);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setAnalysisError("Failed to read the file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Trigger file dialog
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Clear current image selection
  const clearSelection = () => {
    setCustomImage(null);
    setMimeType(null);
    setFileName(null);
    setDamageCategory(null);
    setSelectedSample(null);
    setCurrentAssessment(null);
    setAnalysisError(null);
    setActiveAppraisalId(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  // Run instant simulated analysis (No API key needed)
  const loadSimulatedAssessment = (sample: SampleCar) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalysisProgress("Initializing simulated model weights...");
    
    setTimeout(() => {
      setAnalysisProgress("Retrieving pre-certified vehicle appraisal parameters...");
      setTimeout(() => {
        setAnalysisProgress("Parsing structural dent depths...");
        setTimeout(() => {
          const rawAssessment = JSON.parse(JSON.stringify(sample.mockAssessment));
          const assessment = overrideAssessmentWithPricing(rawAssessment, shopOwnerPricing);
          setCurrentAssessment(assessment);
          setIsAnalyzing(false);
          saveAppraisalToHistory(assessment, sample.imageUrl, sample.title);
        }, 400);
      }, 400);
    }, 400);
  };

  // Run actual Live AI Gemini Analysis on the server
  const runLiveAnalysis = async (imageSrc: string, selectedMime: string | null) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentAssessment(null);

    const steps = [
      "Connecting to AutoGuard AI appraisal engine...",
      "Analyzing vehicle chassis geometry...",
      "Detecting surface dent severity (Micro-mesh scan)...",
      "Validating damaged component assemblies...",
      "Calculating realistic Indian regional repair costs (INR)..."
    ];

    let currentStep = 0;
    setAnalysisProgress(steps[0]);

    const progressInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setAnalysisProgress(steps[currentStep]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc,
          mimeType: selectedMime || "image/jpeg",
          fileName: fileName || null,
          damageCategory: damageCategory || null,
          shopOwnerPricing: shopOwnerPricing,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const result: DamageAssessment = await response.json();
      setCurrentAssessment(result);
      saveAppraisalToHistory(result, imageSrc, result.car_model_identified || "Custom Upload");
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Analysis failure:", err);
      setAnalysisError(
        err.message || "Cognitive evaluation failed. Please verify that your Gemini API key is configured correctly in the Secrets menu."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save appraisal to the dynamic history tracker
  const saveAppraisalToHistory = async (assessment: DamageAssessment, imageSrc: string, carName: string) => {
    try {
      let finalImg = imageSrc;
      if (imageSrc.startsWith("data:image")) {
        finalImg = await shrinkForStorage(imageSrc);
      }

      const generatedId = Date.now().toString();
      setActiveAppraisalId(generatedId);

      const newAppraisal: SavedAppraisal = {
        id: generatedId,
        timestamp: Date.now(),
        car_model_identified: assessment.car_model_identified || carName || "Vehicle Appraisal",
        overall_damage_severity: assessment.overall_damage_severity,
        total_estimated_cost_INR: assessment.total_estimated_cost_INR,
        imageUrl: finalImg,
        assessment: { ...assessment },
        customerName,
        customerPhone,
        customerAddress,
      };

      setRecentAppraisals((prev) => {
        const filtered = prev.filter(
          (item) => 
            !(item.car_model_identified === newAppraisal.car_model_identified && 
              item.total_estimated_cost_INR === newAppraisal.total_estimated_cost_INR)
        );
        const updated = [newAppraisal, ...filtered].slice(0, 5);
        localStorage.setItem("autoguard_appraisals", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to save appraisal to history:", error);
    }
  };

  const deleteAppraisalFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRecentAppraisals((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("autoguard_appraisals", JSON.stringify(updated));
      return updated;
    });
    if (activeAppraisalId === id) {
      setActiveAppraisalId(null);
      setCustomImage(null);
      setMimeType(null);
      setSelectedSample(null);
      setCurrentAssessment(null);
      setAnalysisError(null);
    }
  };

  const clearAllHistory = () => {
    setRecentAppraisals([]);
    localStorage.removeItem("autoguard_appraisals");
    setActiveAppraisalId(null);
  };

  const loadSavedAppraisal = (appraisal: SavedAppraisal) => {
    setAnalysisError(null);
    setIsAnalyzing(false);
    setActiveAppraisalId(appraisal.id);
    setCurrentAssessment(appraisal.assessment);
    setCustomerName(appraisal.customerName || "");
    setCustomerPhone(appraisal.customerPhone || "");
    setCustomerAddress(appraisal.customerAddress || "");
    
    const matchedSample = SAMPLE_CARS.find(
      (car) => car.imageUrl === appraisal.imageUrl || car.title === appraisal.car_model_identified
    );
    if (matchedSample) {
      setSelectedSample(matchedSample);
      setCustomImage(null);
    } else {
      setSelectedSample(null);
      setCustomImage(appraisal.imageUrl);
    }
  };

  // Handle updates to the assessment state (e.g., manual edits)
  const handleUpdateAssessment = (updated: DamageAssessment) => {
    setCurrentAssessment(updated);
    if (activeAppraisalId) {
      setRecentAppraisals((prev) => {
        const updatedHistory = prev.map((item) => {
          if (item.id === activeAppraisalId) {
            return {
              ...item,
              car_model_identified: updated.car_model_identified,
              overall_damage_severity: updated.overall_damage_severity,
              total_estimated_cost_INR: updated.total_estimated_cost_INR,
              assessment: { ...updated },
            };
          }
          return item;
        });
        localStorage.setItem("autoguard_appraisals", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  };

  if (shareId) {
    const sample = SAMPLE_CARS.find(c => c.id === sharedAppraisalData?.selectedSampleId);
    const vehicleImg = sharedAppraisalData?.customImage || sample?.imageUrl || "";

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Adjuster Portal Header */}
        <header className="bg-slate-900 border-b border-slate-800 text-white py-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/25 text-sky-400 rounded-xl">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                AUTOGUARD COLLISION
                <span className="text-[10px] bg-sky-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-extrabold uppercase">
                  Adjuster Portal
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Insurance Adjuster Remote Review Console</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setShareId(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-3.5 rounded-xl text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Audit Mode
          </button>
        </header>

        {isSharedLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Retrieving shared appraisal voucher...</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">{shareId}</p>
            </div>
          </div>
        ) : sharedError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Deep-Link Expired or Invalid</h2>
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl leading-relaxed">
                {sharedError}
              </p>
            </div>
            <button
              onClick={() => {
                setShareId(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              Go to Landing Gateway
            </button>
          </div>
        ) : sharedAppraisalData ? (
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Panel: Review controls & metadata */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Claim Review Actions card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-sky-500" /> Adjuster Claim Audit
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Submit your official insurance baseline determination.</p>
                </div>

                {reviewSubmitted ? (
                  <div className="space-y-4 pt-2">
                    <div className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-3 relative overflow-hidden ${
                      sharedAppraisalData.status === "approved" 
                        ? "bg-emerald-50/60 border-emerald-100 text-emerald-800" 
                        : sharedAppraisalData.status === "rejected"
                        ? "bg-rose-50/60 border-rose-100 text-rose-800"
                        : "bg-amber-50/60 border-amber-100 text-amber-800"
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
                        sharedAppraisalData.status === "approved" 
                          ? "bg-emerald-100 text-emerald-600" 
                          : sharedAppraisalData.status === "rejected"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-amber-100 text-amber-600"
                      }`}>
                        {sharedAppraisalData.status === "approved" && <CheckCircle className="w-6 h-6" />}
                        {sharedAppraisalData.status === "rejected" && <AlertCircle className="w-6 h-6" />}
                        {sharedAppraisalData.status === "changes_requested" && <HelpCircle className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-slate-400">DECISION STAMPED</div>
                        <h4 className="text-lg font-black uppercase tracking-wide mt-0.5">
                          {sharedAppraisalData.status === "approved" && "Appraisal Approved"}
                          {sharedAppraisalData.status === "rejected" && "Appraisal Rejected"}
                          {sharedAppraisalData.status === "changes_requested" && "Changes Requested"}
                        </h4>
                      </div>

                      {sharedAppraisalData.adjusterNotes && (
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl p-3 text-xs text-slate-600 text-left w-full font-sans italic leading-relaxed">
                          "{sharedAppraisalData.adjusterNotes}"
                        </div>
                      )}

                      {sharedAppraisalData.adjusterSignature && (
                        <div className="border-t border-slate-200/50 pt-2.5 w-full flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">E-SIGNED BY ADJUSTER</span>
                          <span className="font-serif italic text-lg text-slate-800 font-bold mt-1 tracking-wider">
                            {sharedAppraisalData.adjusterSignature}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setReviewSubmitted(false)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 active:scale-95 cursor-pointer"
                    >
                      Revise Audit Stamp
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 block">Audit Action</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "approved", label: "Approve", color: "border-emerald-500 text-emerald-600 bg-emerald-50/20" },
                          { id: "changes_requested", label: "Revise", color: "border-amber-500 text-amber-600 bg-amber-50/20" },
                          { id: "rejected", label: "Reject", color: "border-rose-500 text-rose-600 bg-rose-50/20" }
                        ].map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => setAdjusterStatus(act.id as any)}
                            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                              adjusterStatus === act.id
                                ? `${act.color} border-2 shadow-inner`
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Reviewer Notes & Baseline Adjustments</label>
                      <textarea
                        rows={3}
                        value={adjusterNotes}
                        onChange={(e) => setAdjusterNotes(e.target.value)}
                        placeholder="e.g. Labor rates confirmed with Delhi baseline; parts matching certified workshop parameters."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition rounded-xl p-3 text-xs leading-relaxed focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Digital Verification Sign-off</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={adjusterSignature}
                          onChange={(e) => setAdjusterSignature(e.target.value)}
                          placeholder="Type name to e-sign"
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-serif italic text-sm tracking-wider transition rounded-xl pl-3 pr-8 py-2.5 focus:outline-none font-bold"
                        />
                        <div className="absolute top-2.5 right-2 text-slate-400">
                          <FileSignature className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview || !adjusterSignature.trim()}
                      className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 active:scale-95 cursor-pointer shadow-md"
                    >
                      {submittingReview ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sealing Decision...
                        </span>
                      ) : (
                        "Commit Decision Stamp"
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Secure Token Meta Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs tracking-tight uppercase font-mono">Deep-Link Voucher Specs</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Reference Claim</span>
                    <span className="font-mono text-slate-800 font-bold">{shareId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Verification Source</span>
                    <span className="text-slate-800 font-bold">AutoGuard AI Appraisal Engine</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Pricing Source</span>
                    <span className="text-slate-800 font-bold">
                      Standard Indian Sedan Baseline
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Link Created At</span>
                    <span className="text-slate-800 font-bold">
                      {new Date(sharedAppraisalData.createdAt).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short"
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono uppercase text-[10px]">Link Expires At</span>
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      {new Date(sharedAppraisalData.expiresAt).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short"
                      })}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Panel: The actual visual appraisal in read-only mode */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Appraisal Vehicle Photo Box */}
              {vehicleImg && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-sky-500" /> Inspected Damage Photograph
                      </h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">High-fidelity Visual Evidence baseline.</p>
                    </div>
                    {sample && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2.5 py-1 rounded-xl border border-slate-200 font-extrabold">
                        {sample.title} Preset
                      </span>
                    )}
                  </div>
                  
                  <div className="relative rounded-2xl overflow-hidden aspect-video max-h-[380px] bg-slate-950 border border-slate-800 shadow flex items-center justify-center">
                    <DamageVisualOverlay
                      imageUrl={vehicleImg}
                      assessment={sharedAppraisalData.assessment}
                      selectedPart={selectedPart}
                      onSelectPart={setSelectedPart}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Damaged Parts Assessment Summary in Read-Only Mode */}
              <DamageSummaryReport
                assessment={sharedAppraisalData.assessment}
                onUpdateAssessment={() => {}}
                onReset={() => {}}
                currency={sharedAppraisalData.currency || "INR"}
                selectedPart={selectedPart}
                onSelectPart={setSelectedPart}
                readOnly={true}
                customImage={sharedAppraisalData.customImage}
                selectedSample={sample}
                customerName={sharedAppraisalData.customerName}
                customerPhone={sharedAppraisalData.customerPhone}
                customerAddress={sharedAppraisalData.customerAddress}
              />

            </div>

          </div>
        ) : null}

        <footer className="bg-slate-100 border-t border-slate-200 text-center py-4 text-xs text-slate-400 mt-auto font-mono flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>© 2026 AutoGuard Appraisal Engines.</span>
          <span className="hidden sm:inline">•</span>
          <span>Standard Indian Mid-range Sedan Reference Rates: Delhi NCR • Mumbai • Bengaluru</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header 
          currency={currency} 
          onCurrencyChange={setCurrency} 
          authUser={authUser}
          onLogout={handleUserLogout}
        />

      {/* Premium Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex">
          <button
            onClick={() => setActiveTab("appraiser")}
            className={`py-4 px-6 font-semibold text-sm flex items-center gap-2 border-b-2 transition duration-200 relative cursor-pointer ${
              activeTab === "appraiser"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <Cpu className={`w-4 h-4 ${activeTab === "appraiser" ? "text-blue-600 dark:text-blue-400" : ""}`} />
            Automated Damage Appraiser
          </button>
          <button
            onClick={() => setActiveTab("pricelist")}
            className={`py-4 px-6 font-semibold text-sm flex items-center gap-2 border-b-2 transition duration-200 relative cursor-pointer ${
              activeTab === "pricelist"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === "pricelist" ? "text-blue-600 dark:text-blue-400" : ""}`} />
            Shop Inventory & Pricing List
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900 uppercase font-bold tracking-wider">
              Truth Source
            </span>
          </button>
        </div>
      </div>

      {activeTab === "pricelist" ? (
        <UserProtectedRoute
          isAuthenticated={isUserAuthenticated}
          onLoginSuccess={handleUserLoginSuccess}
        >
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 space-y-6">
            {/* Authenticated Admin Control Bar */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <User className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1.5 uppercase font-bold">
                    <span>Admin Access Granted</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-sm font-extrabold text-white flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{authUser?.email || "admin@autoguard.com"}</span> 
                    <span className="text-[10px] font-mono bg-slate-800 text-sky-400 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                      {authUser?.role || "Showroom Admin"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleUserLogout}
                className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-900/40 hover:border-rose-800/80 px-4.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Console</span>
              </button>
            </div>

            <InventoryPricingEditor
              shopOwnerPricing={shopOwnerPricing}
              setShopOwnerPricing={setShopOwnerPricing}
              currency={currency}
            />
          </div>
        </UserProtectedRoute>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Vehicle Photo Upload Section (takes up the FULL width at the top) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Vehicle Photo Upload
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            Upload a clear JPEG, PNG, or WEBP photograph of the damaged area. For best estimates, ensure headlights, panels, and bumpers are fully visible.
          </p>

            {/* Drag & Drop Box or Live Camera View */}
            {isCameraActive ? (
              <div className="border-2 border-slate-800 rounded-3xl p-4 bg-slate-950 text-white relative overflow-hidden flex flex-col items-center">
                {cameraError ? (
                  <div className="py-6 px-4 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-450 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-rose-200 leading-relaxed">{cameraError}</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => startCamera(selectedDeviceId)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-4 rounded-xl text-xs transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {/* Camera selector if multiple devices */}
                    {cameraDevices.length > 1 && (
                      <div className="flex items-center gap-2 justify-between bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-400 text-[10px] font-mono tracking-wider">ACTIVE CAMERA:</span>
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => handleDeviceChange(e.target.value)}
                          className="bg-transparent border-none text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
                        >
                          {cameraDevices.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId} className="bg-slate-900 text-white">
                              {device.label || `Webcam ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-black flex items-center justify-center border border-slate-800">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-extrabold flex items-center gap-1.5 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                        LIVE WEBCAM
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-center pt-1">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                      >
                        <Camera className="w-4 h-4 text-white animate-pulse" /> Capture Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={!customImage && !selectedSample ? triggerFileInput : undefined}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition relative overflow-hidden group ${
                  isDragging
                    ? "border-blue-500 bg-blue-950/20"
                    : customImage || selectedSample
                    ? "border-slate-850 bg-slate-950/40 cursor-default"
                    : "border-slate-800 hover:border-blue-500 hover:bg-slate-900/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Preview or Upload prompt */}
                {customImage ? (
                  <div className="space-y-4 max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col md:flex-row gap-5 items-center justify-center p-2">
                      <div className="relative w-full max-w-sm md:w-[360px] h-52 sm:h-64 md:h-[230px] rounded-2xl overflow-hidden border border-slate-800 shadow-lg shrink-0">
                        <DamageVisualOverlay
                          imageUrl={customImage}
                          assessment={currentAssessment}
                          selectedPart={selectedPart}
                          onSelectPart={setSelectedPart}
                          damageCategory={damageCategory}
                          setDamageCategory={setDamageCategory}
                          className="w-full h-full animate-fadeIn"
                        />
                        <div className="absolute top-2 right-2 z-20 pointer-events-none">
                          <span className="text-[10px] font-mono font-bold text-white bg-slate-950/85 px-2.5 py-1 rounded border border-slate-850 uppercase tracking-widest shadow-lg">
                            User Photo
                          </span>
                        </div>
                      </div>

                      {/* Guidance category selector */}
                      <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                            Identify Damage Focus (Highly Recommended)
                          </label>
                          {damageCategory && (
                            <button
                              type="button"
                              onClick={() => setDamageCategory(null)}
                              className="text-[10px] text-rose-400 hover:underline font-bold cursor-pointer"
                            >
                              Reset Focus
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "windshield", label: "Glass & Windshield", icon: "💎" },
                            { key: "front", label: "Front Bumper & Grille", icon: "🚘" },
                            { key: "side", label: "Side Doors & Mirror", icon: "🚪" },
                            { key: "rear", label: "Rear Bumper & Trunk", icon: "🚗" }
                          ].map((cat) => {
                            const isSel = damageCategory === cat.key;
                            return (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => setDamageCategory(isSel ? null : cat.key)}
                                className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold text-left border flex items-center gap-2 transition cursor-pointer select-none ${
                                  isSel 
                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-white"
                                }`}
                              >
                                <span className="text-sm">{cat.icon}</span>
                                <span className="truncate">{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5 justify-center">
                      <button
                        type="button"
                        onClick={() => runLiveAnalysis(customImage, mimeType)}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-2xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      >
                        <Cpu className="w-4.5 h-4.5 text-white" /> Run AI Diagnosis
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        disabled={isAnalyzing}
                        className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" /> Clear
                      </button>
                    </div>
                  </div>
                ) : selectedSample ? (
                  <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col md:flex-row gap-5 items-center justify-center p-2">
                      <div className="relative w-full max-w-sm md:w-[320px] h-52 sm:h-56 md:h-[200px] rounded-2xl overflow-hidden border border-slate-800 shadow-lg shrink-0">
                        <DamageVisualOverlay
                          imageUrl={selectedSample.imageUrl}
                          assessment={currentAssessment}
                          selectedPart={selectedPart}
                          onSelectPart={setSelectedPart}
                          damageCategory={damageCategory}
                          setDamageCategory={setDamageCategory}
                          className="w-full h-full animate-fadeIn"
                        />
                        <div className="absolute top-2 right-2 z-20 pointer-events-none">
                          <span className="text-[10px] font-mono font-bold text-white bg-slate-950/85 px-2.5 py-1 rounded border border-slate-850 uppercase tracking-widest shadow-lg">
                            Preset Demo
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <h4 className="font-extrabold text-white text-sm">{selectedSample.title}</h4>
                        <p className="text-xs text-slate-400 leading-normal">{selectedSample.description}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5 justify-center">
                      <button
                        type="button"
                        onClick={() => loadSimulatedAssessment(selectedSample)}
                        disabled={isAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      >
                        <Sparkles className="w-4.5 h-4.5 text-white" /> Quick Load (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => runLiveAnalysis(selectedSample.imageUrl, "image/jpeg")}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-2xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      >
                        <Cpu className="w-4.5 h-4.5 text-white" /> Live AI Diagnosis
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        disabled={isAnalyzing}
                        className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-450" /> Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Drag & drop your vehicle photo here, or <span className="text-blue-400 group-hover:underline">browse files</span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-1">Supports PNG, JPG, JPEG, WEBP files up to 25MB</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800/80 w-full flex justify-center mt-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-blue-400" /> Take Photo with Webcam
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content Layout below the upload card */}
          {isAnalyzing ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 space-y-6">
                {/* Preset Selector */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Quick-Test Preset Vehicles
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">4 Presets Available</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    No photo on hand? Select one of our pre-configured real-world scenario vehicles below. You can try the live AI diagnostic or load the pre-calculated sheet instantly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {SAMPLE_CARS.map((car) => {
                      const isSelected = selectedSample?.id === car.id;
                      return (
                        <button
                          key={car.id}
                          onClick={() => {
                            if (!isAnalyzing) {
                              setSelectedSample(car);
                              setCustomImage(null);
                              setCurrentAssessment(null);
                              setAnalysisError(null);
                            }
                          }}
                          disabled={isAnalyzing}
                          className={`text-left p-3 rounded-2xl border transition flex gap-3 items-start group relative cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                          }`}
                        >
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-white transition">
                              {car.title.replace(/\(.*\)/, "")}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-2 mt-0.5 leading-normal">
                              {car.description}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* History tracker */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Recent Appraisals
                    </h3>
                    {recentAppraisals.length > 0 && (
                      <button
                        onClick={clearAllHistory}
                        className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {recentAppraisals.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 animate-fadeIn">
                      <History className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">No recent appraisals yet</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Run a diagnosis to start tracking history.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {recentAppraisals.map((appraisal) => {
                        const isActive = activeAppraisalId === appraisal.id;
                        const formattedCost = formatHistoryCost(appraisal.total_estimated_cost_INR);
                        const diffMinutes = Math.floor((Date.now() - appraisal.timestamp) / 60000);
                        const relativeTime = diffMinutes < 1 
                          ? "Just now" 
                          : diffMinutes < 60 
                          ? `${diffMinutes}m ago` 
                          : `${Math.floor(diffMinutes / 60)}h ago`;
                        return (
                          <div
                            key={appraisal.id}
                            onClick={() => loadSavedAppraisal(appraisal)}
                            className={`group/item text-left p-2.5 rounded-xl border transition flex gap-3 items-center cursor-pointer relative ${
                              isActive
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_12px_rgba(59,130,246,0.1)] dark:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                            }`}
                          >
                            <img
                              src={appraisal.imageUrl}
                              alt={appraisal.car_model_identified}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover/item:text-blue-600 dark:group-hover/item:text-white">
                                  {appraisal.car_model_identified}
                                </h4>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{relativeTime}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide font-mono ${
                                  appraisal.overall_damage_severity === "Severe"
                                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : appraisal.overall_damage_severity === "Moderate"
                                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                  {appraisal.overall_damage_severity}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-extrabold">
                                  {formattedCost}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteAppraisalFromHistory(e, appraisal.id)}
                              className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition md:opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Baseline card */}
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">AutoGuard Integrity Baseline</span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">Indian Market Rate Standards</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      Repairs are estimated strictly in accordance with standard workshop labor and paint booth charges in Delhi NCR, Mumbai, and Bangalore.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active AI Processing Screen */}
              <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative flex items-center justify-center">
                  {/* Spinning Outer Ring */}
                  <div className="w-20 h-20 rounded-full border-4 border-slate-850 border-t-blue-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                  <div className="absolute w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 max-w-sm">
                  <h3 className="font-extrabold text-white text-lg flex items-center justify-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-bounce" /> Running AutoGuard AI
                  </h3>
                  <p className="text-blue-450 text-xs font-semibold font-mono bg-slate-950 border border-slate-800 py-2 px-4 rounded-xl inline-block shadow-sm">
                    {analysisProgress}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed pt-1">
                    This multi-modal diagnostic usually completes in 3-5 seconds depending on image file density.
                  </p>
                </div>
              </div>
            </div>
          ) : analysisError ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 space-y-6">
                {/* Preset Selector */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Quick-Test Preset Vehicles
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">4 Presets Available</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    No photo on hand? Select one of our pre-configured real-world scenario vehicles below. You can try the live AI diagnostic or load the pre-calculated sheet instantly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {SAMPLE_CARS.map((car) => {
                      const isSelected = selectedSample?.id === car.id;
                      return (
                        <button
                          key={car.id}
                          onClick={() => {
                            if (!isAnalyzing) {
                              setSelectedSample(car);
                              setCustomImage(null);
                              setCurrentAssessment(null);
                              setAnalysisError(null);
                            }
                          }}
                          disabled={isAnalyzing}
                          className={`text-left p-3 rounded-2xl border transition flex gap-3 items-start group relative cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                          }`}
                        >
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-white transition">
                              {car.title.replace(/\(.*\)/, "")}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-2 mt-0.5 leading-normal">
                              {car.description}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* History tracker */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Recent Appraisals
                    </h3>
                    {recentAppraisals.length > 0 && (
                      <button
                        onClick={clearAllHistory}
                        className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {recentAppraisals.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 animate-fadeIn">
                      <History className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">No recent appraisals yet</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Run a diagnosis to start tracking history.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {recentAppraisals.map((appraisal) => {
                        const isActive = activeAppraisalId === appraisal.id;
                        const formattedCost = formatHistoryCost(appraisal.total_estimated_cost_INR);
                        const diffMinutes = Math.floor((Date.now() - appraisal.timestamp) / 60000);
                        const relativeTime = diffMinutes < 1 
                          ? "Just now" 
                          : diffMinutes < 60 
                          ? `${diffMinutes}m ago` 
                          : `${Math.floor(diffMinutes / 60)}h ago`;
                        return (
                          <div
                            key={appraisal.id}
                            onClick={() => loadSavedAppraisal(appraisal)}
                            className={`group/item text-left p-2.5 rounded-xl border transition flex gap-3 items-center cursor-pointer relative ${
                              isActive
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_12px_rgba(59,130,246,0.1)] dark:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                            }`}
                          >
                            <img
                              src={appraisal.imageUrl}
                              alt={appraisal.car_model_identified}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover/item:text-blue-600 dark:group-hover/item:text-white">
                                  {appraisal.car_model_identified}
                                </h4>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{relativeTime}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide font-mono ${
                                  appraisal.overall_damage_severity === "Severe"
                                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : appraisal.overall_damage_severity === "Moderate"
                                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                  {appraisal.overall_damage_severity}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-extrabold">
                                  {formattedCost}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteAppraisalFromHistory(e, appraisal.id)}
                              className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition md:opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Baseline card */}
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">AutoGuard Integrity Baseline</span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">Indian Market Rate Standards</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      Repairs are estimated strictly in accordance with standard workshop labor and paint booth charges in Delhi NCR, Mumbai, and Bangalore.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Failure Notification */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 min-h-[400px] flex flex-col justify-center items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
                  <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Cognitive Analysis Interrupted</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    {analysisError}
                  </p>
                </div>

                {/* Guide user to simulated options if API key is not configured */}
                {analysisError.includes("GEMINI_API_KEY") && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 max-w-md text-left space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span>How to proceed without an API Key?</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      You do not need an API key to evaluate the interactive report features! Click any vehicle in the preset grid below, then select the <strong className="font-bold text-slate-800 dark:text-white">"Quick Load (Instant)"</strong> button. This populates a pre-calculated certified estimate report instantly.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setAnalysisError(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Dismiss Error
                </button>
              </div>
            </div>
          ) : currentAssessment ? (
            /* Active Damage Estimate Sheet (Estimates & Charts side-by-side inside DamageSummaryReport) */
            <div className="space-y-6">
              <div className="space-y-4 animate-fadeIn">
                {currentAssessment.is_fallback ? (
                  <div className="bg-amber-950/40 border border-amber-900/40 text-amber-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold no-print">
                    <span className="flex items-center gap-2">
                      <Info className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                      <span>Local Fallback Mode Activated (Live AI connection was unavailable, but local high-fidelity estimation is active)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded shadow-sm self-start sm:self-auto font-bold uppercase tracking-wider">Local Mode</span>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-900/40 text-emerald-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs font-semibold no-print">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Appraisal Certificate Generated Successfully
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-50 text-slate-950 px-2.5 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider">Certified</span>
                  </div>
                )}
                <DamageSummaryReport 
                  assessment={currentAssessment}
                  onUpdateAssessment={handleUpdateAssessment}
                  onReset={clearSelection}
                  currency={currency}
                  selectedPart={selectedPart}
                  onSelectPart={setSelectedPart}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerAddress={customerAddress}
                  onCustomerNameChange={setCustomerName}
                  onCustomerPhoneChange={setCustomerPhone}
                  onCustomerAddressChange={setCustomerAddress}
                />
              </div>

              {/* Presets and history positioned beautifully below the full-width report */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-slate-200 dark:border-slate-800/80 pt-6">
                <div className="lg:col-span-7">
                  {/* Preset Selector */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Quick-Test Preset Vehicles
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">4 Presets Available</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      No photo on hand? Select one of our pre-configured real-world scenario vehicles below. You can try the live AI diagnostic or load the pre-calculated sheet instantly.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {SAMPLE_CARS.map((car) => {
                        const isSelected = selectedSample?.id === car.id;
                        return (
                          <button
                            key={car.id}
                            onClick={() => {
                              if (!isAnalyzing) {
                                setSelectedSample(car);
                                setCustomImage(null);
                                setCurrentAssessment(null);
                                setAnalysisError(null);
                              }
                            }}
                            disabled={isAnalyzing}
                            className={`text-left p-3 rounded-2xl border transition flex gap-3 items-start group relative cursor-pointer ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                            }`}
                          >
                            <img
                              src={car.imageUrl}
                              alt={car.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-white transition">
                                {car.title.replace(/\(.*\)/, "")}
                              </h4>
                              <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-2 mt-0.5 leading-normal">
                                {car.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-6">
                  {/* History tracker */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Recent Appraisals
                      </h3>
                      {recentAppraisals.length > 0 && (
                        <button
                          onClick={clearAllHistory}
                          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {recentAppraisals.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 animate-fadeIn">
                        <History className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-2" />
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">No recent appraisals yet</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Run a diagnosis to start tracking history.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {recentAppraisals.map((appraisal) => {
                          const isActive = activeAppraisalId === appraisal.id;
                          const formattedCost = formatHistoryCost(appraisal.total_estimated_cost_INR);
                          const diffMinutes = Math.floor((Date.now() - appraisal.timestamp) / 60000);
                          const relativeTime = diffMinutes < 1 
                            ? "Just now" 
                            : diffMinutes < 60 
                            ? `${diffMinutes}m ago` 
                            : `${Math.floor(diffMinutes / 60)}h ago`;
                          return (
                            <div
                              key={appraisal.id}
                              onClick={() => loadSavedAppraisal(appraisal)}
                              className={`group/item text-left p-2.5 rounded-xl border transition flex gap-3 items-center cursor-pointer relative ${
                                isActive
                                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_12px_rgba(59,130,246,0.1)] dark:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                              }`}
                            >
                              <img
                                src={appraisal.imageUrl}
                                alt={appraisal.car_model_identified}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover/item:text-blue-600 dark:group-hover/item:text-white">
                                    {appraisal.car_model_identified}
                                  </h4>
                                  <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{relativeTime}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide font-mono ${
                                    appraisal.overall_damage_severity === "Severe"
                                      ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                      : appraisal.overall_damage_severity === "Moderate"
                                      ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  }`}>
                                    {appraisal.overall_damage_severity}
                                  </span>
                                  <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-extrabold">
                                    {formattedCost}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => deleteAppraisalFromHistory(e, appraisal.id)}
                                className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition md:opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                                title="Delete from history"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Baseline card */}
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">AutoGuard Integrity Baseline</span>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">Indian Market Rate Standards</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                        Repairs are estimated strictly in accordance with standard workshop labor and paint booth charges in Delhi NCR, Mumbai, and Bangalore.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State: Guide & Presets side-by-side */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 space-y-6">
                {/* Preset Selector */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Quick-Test Preset Vehicles
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">4 Presets Available</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    No photo on hand? Select one of our pre-configured real-world scenario vehicles below. You can try the live AI diagnostic or load the pre-calculated sheet instantly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {SAMPLE_CARS.map((car) => {
                      const isSelected = selectedSample?.id === car.id;
                      return (
                        <button
                          key={car.id}
                          onClick={() => {
                            if (!isAnalyzing) {
                              setSelectedSample(car);
                              setCustomImage(null);
                              setCurrentAssessment(null);
                              setAnalysisError(null);
                            }
                          }}
                          disabled={isAnalyzing}
                          className={`text-left p-3 rounded-2xl border transition flex gap-3 items-start group relative cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                          }`}
                        >
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-white transition">
                              {car.title.replace(/\(.*\)/, "")}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] line-clamp-2 mt-0.5 leading-normal">
                              {car.description}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* History tracker */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Recent Appraisals
                    </h3>
                    {recentAppraisals.length > 0 && (
                      <button
                        onClick={clearAllHistory}
                        className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {recentAppraisals.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 animate-fadeIn">
                      <History className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">No recent appraisals yet</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Run a diagnosis to start tracking history.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {recentAppraisals.map((appraisal) => {
                        const isActive = activeAppraisalId === appraisal.id;
                        const formattedCost = formatHistoryCost(appraisal.total_estimated_cost_INR);
                        const diffMinutes = Math.floor((Date.now() - appraisal.timestamp) / 60000);
                        const relativeTime = diffMinutes < 1 
                          ? "Just now" 
                          : diffMinutes < 60 
                          ? `${diffMinutes}m ago` 
                          : `${Math.floor(diffMinutes / 60)}h ago`;
                        return (
                          <div
                            key={appraisal.id}
                            onClick={() => loadSavedAppraisal(appraisal)}
                            className={`group/item text-left p-2.5 rounded-xl border transition flex gap-3 items-center cursor-pointer relative ${
                              isActive
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_12px_rgba(59,130,246,0.1)] dark:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                            }`}
                          >
                            <img
                              src={appraisal.imageUrl}
                              alt={appraisal.car_model_identified}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover/item:text-blue-600 dark:group-hover/item:text-white">
                                  {appraisal.car_model_identified}
                                </h4>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{relativeTime}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide font-mono ${
                                  appraisal.overall_damage_severity === "Severe"
                                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : appraisal.overall_damage_severity === "Moderate"
                                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                  {appraisal.overall_damage_severity}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-extrabold">
                                  {formattedCost}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteAppraisalFromHistory(e, appraisal.id)}
                              className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition md:opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Baseline card */}
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">AutoGuard Integrity Baseline</span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">Indian Market Rate Standards</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      Repairs are estimated strictly in accordance with standard workshop labor and paint booth charges in Delhi NCR, Mumbai, and Bangalore.
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Claims Operations Guide empty state */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 md:p-10 min-h-[500px] flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 text-[10px] font-mono tracking-widest font-extrabold uppercase block">Claims Operations Guide</span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                      <FileCheck className="w-6 h-6 text-blue-500 dark:text-blue-400" /> Standard Appraisal Procedure
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                      AutoGuard incorporates custom-trained computer vision and multi-modal reasoning models to draft instant vehicle repair estimates that match standard regional garage sheets in India.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Provide Vehicle Damage Photo</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Drag-and-drop a photograph of the car dent or scratch onto the upload zone, or click a pre-configured vehicle from our preset grid.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Initiate Appraisal Scan</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Click "Run Live AI Diagnosis" to analyze using real-time Google Gemini models, or click "Quick Load" on a preset for instant simulated testing.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Tune Estimate and Export</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Modify part severities, override cost estimations, append manually identified broken components, and export a print-friendly claim sheet.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick trial promotion */}
                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Ready to see it in action?</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Click the Suzuki Swift preset below and select Quick Load.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSample(SAMPLE_CARS[0]);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 transition select-none cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  >
                    Load Swift Preset <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

      </main>
      )}

      <footer className="bg-slate-100 border-t border-slate-200 text-center py-4 text-xs text-slate-400 mt-auto font-mono flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>© 2026 AutoGuard Appraisal Engines.</span>
        <span className="hidden sm:inline">•</span>
        <span>Standard Indian Mid-range Sedan Reference Rates: Delhi NCR • Mumbai • Bengaluru</span>
      </footer>
    </div>
  );
}
