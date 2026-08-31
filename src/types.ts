export interface DamageDetail {
  part_name: string;
  damage_description: string;
  action_required: "Repair" | "Replace";
  estimated_cost_INR: number;
  damage_percentage: number;
  bounding_box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-100 percentage
  polygon_points?: string; // Optional SVG polygon coordinate string e.g. "10,60 90,60 88,82 50,90 12,82"
}

export interface DamageAssessment {
  car_model_identified: string;
  vehicle_segment?: string;
  overall_damage_severity: "Minor" | "Moderate" | "Severe";
  damage_details: DamageDetail[];
  total_estimated_cost_INR: number;
  is_fallback?: boolean;
}

export interface SampleCar {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  mockAssessment: DamageAssessment;
}

export interface SavedAppraisal {
  id: string;
  timestamp: number;
  car_model_identified: string;
  overall_damage_severity: "Minor" | "Moderate" | "Severe";
  total_estimated_cost_INR: number;
  imageUrl: string;
  assessment: DamageAssessment;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

