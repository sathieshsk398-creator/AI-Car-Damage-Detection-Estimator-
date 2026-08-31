import { DamageAssessment, DamageDetail } from "../types";

export type PricingMatrix = Record<string, Record<string, { repair: number; replace: number }>>;

/**
 * Normalizes and matches a part name against the custom shop owner pricing keys.
 * Uses a prioritized multi-tier matching strategy:
 * 1. Exact case-insensitive match
 * 2. Keyword/Synonym expansion matches for common vehicle parts
 * 3. Substring containment
 */
export function getMatchedComponentKey(partName: string, segmentPricing: Record<string, { repair: number; replace: number }>): string | null {
  const lowerName = partName.toLowerCase();
  const keys = Object.keys(segmentPricing);

  // Tier 1: Exact Match (Case-Insensitive)
  for (const key of keys) {
    if (lowerName === key.toLowerCase()) {
      return key;
    }
  }

  // Tier 2: Specialized Keyword Expansion Matches
  if (lowerName.includes("windshield") || lowerName.includes("window") || lowerName.includes("glass")) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("glass") || kl.includes("window") || kl.includes("windshield");
    });
    if (match) return match;
  }
  
  if (lowerName.includes("rear bumper") || (lowerName.includes("bumper") && lowerName.includes("rear"))) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("rear bumper") || (kl.includes("bumper") && kl.includes("rear"));
    });
    if (match) return match;
  }
  
  if (lowerName.includes("front bumper") || (lowerName.includes("bumper") && (lowerName.includes("front") || lowerName.includes("head") || lowerName.includes("gril")))) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("front bumper") || (kl.includes("bumper") && kl.includes("front"));
    });
    if (match) return match;
  }
  
  if (lowerName.includes("headlight") || lowerName.includes("headlamp") || lowerName.includes("lamp") || lowerName.includes("light")) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("headlight") || kl.includes("headlamp") || kl.includes("light") || kl.includes("lamp");
    });
    if (match) return match;
  }
  
  if (lowerName.includes("fender")) {
    const match = keys.find(k => k.toLowerCase().includes("fender"));
    if (match) return match;
  }
  
  if (lowerName.includes("door") || lowerName.includes("panel") || lowerName.includes("side")) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("door") || kl.includes("panel") || kl.includes("side");
    });
    if (match) return match;
  }
  
  if (lowerName.includes("mirror")) {
    const match = keys.find(k => k.toLowerCase().includes("mirror"));
    if (match) return match;
  }
  
  if (lowerName.includes("wiper")) {
    const match = keys.find(k => k.toLowerCase().includes("wiper"));
    if (match) return match;
  }
  
  if (lowerName.includes("grille") || lowerName.includes("grill") || lowerName.includes("radiator")) {
    const match = keys.find(k => {
      const kl = k.toLowerCase();
      return kl.includes("grille") || kl.includes("grill") || kl.includes("radiator");
    });
    if (match) return match;
  }
  
  if (lowerName.includes("hood") || lowerName.includes("bonnet")) {
    const match = keys.find(k => k.toLowerCase().includes("hood") || k.toLowerCase().includes("bonnet"));
    if (match) return match;
  }
  
  if (lowerName.includes("reflector")) {
    const match = keys.find(k => k.toLowerCase().includes("reflector"));
    if (match) return match;
  }
  
  if (lowerName.includes("pillar") || lowerName.includes("trim")) {
    const match = keys.find(k => k.toLowerCase().includes("pillar") || k.toLowerCase().includes("trim"));
    if (match) return match;
  }

  // Tier 3: Substring containment (both directions)
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) {
      return key;
    }
  }

  return null;
}

/**
 * Applies the shop owner's custom pricing to a damage assessment.
 * This guarantees the Zero-Variance Policy by forcing programmatic overrides from the truth database.
 */
export function overrideAssessmentWithPricing(
  assessment: DamageAssessment,
  shopOwnerPricing: PricingMatrix
): DamageAssessment {
  const segment = assessment.vehicle_segment || "Mid-size Sedan";
  const segmentPricing = shopOwnerPricing[segment];

  if (!segmentPricing) {
    return { ...assessment };
  }

  let totalCost = 0;
  const updatedDetails: DamageDetail[] = (assessment.damage_details || []).map((detail) => {
    let originalAction = detail.action_required || "Repair";
    let action: "repair" | "replace" = originalAction.toLowerCase() === "replace" ? "replace" : "repair";
    const matchedKey = getMatchedComponentKey(detail.part_name, segmentPricing);

    let price = detail.estimated_cost_INR;

    if (matchedKey) {
      const pricing = segmentPricing[matchedKey];
      if (pricing) {
        const repairCost = typeof pricing.repair === "number" ? pricing.repair : 0;
        const replacePrice = typeof pricing.replace === "number" ? pricing.replace : 0;

        // Rule 4: The 70% Insurance Financial Rule
        if (action === "repair" && replacePrice > 0 && repairCost >= 0.70 * replacePrice) {
          action = "replace";
          originalAction = "Replace";
          price = replacePrice;
        } else {
          price = typeof pricing[action] === "number" ? pricing[action] : price;
        }
      }
    } else {
      // Fallback: If component is completely unrecognized, use first part or maintain current price
      console.warn(`Could not find custom pricing match for component: ${detail.part_name}`);
    }

    totalCost += price;

    return {
      ...detail,
      action_required: originalAction,
      estimated_cost_INR: price,
    };
  });

  return {
    ...assessment,
    damage_details: updatedDetails,
    total_estimated_cost_INR: totalCost,
  };
}
