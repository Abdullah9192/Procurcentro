import { QuotationScoringConfigurationAttributes } from "../../models/QuotationScoringConfiguration";

interface LineItemInput {
  quotation_item_id: string;
  unit_price?: number;
  delivery_days?: number;
  warranty?: number;
  quality_rating?: number; // optional custom field
}

interface QuotationItemInput {
  id: string;
  unit_price: number;
  delivery_days?: number;
  warranty_months?: number;
  quality_rating?: number;
}

/**
 * Calculate normalized score for a line item based on config
 */
export function calculateScore(
  config: QuotationScoringConfigurationAttributes,
  baseItem: QuotationItemInput,
  supplierItem: LineItemInput
): number {
  let score = 0;

  switch (config.criteria.toLowerCase()) {
    case "price":
      if (baseItem.unit_price && supplierItem.unit_price) {
        score = baseItem.unit_price / supplierItem.unit_price;
      }
      break;

    case "delivery":
      if (supplierItem.delivery_days) {
        // Lower delivery days = better score
        score = 1 / supplierItem.delivery_days;
      }
      break;

    case "warranty":
      if (supplierItem.warranty) {
        score = supplierItem.warranty / 12; // normalize
      }
      break;

    case "quality":
      if (supplierItem.quality_rating) {
        score = supplierItem.quality_rating / 10; // assume rating out of 10
      }
      break;

    default:
      // fallback if unknown criteria
      score = 0;
  }

  // Apply weight
  return score * (config.weight || 1);
}
