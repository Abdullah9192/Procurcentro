import { Request, Response } from "express";
import { createScoringSchema, updateScoringSchema } from "../validators/ScoringValidation";
import QuotationScoring from "../../models/QuotationScoring";
import QuotationScoringConfiguration from "../../models/QuotationScoringConfiguration";

// ✅ Create
export const createQuotationScoring = async (req: Request, res: Response): Promise<void>=> {
  try {
    const { error, value } = createScoringSchema.validate(req.body);
    if (error) res.status(400).json({ success: false, message: error.message });

    const { configurations, ...scoringData } = value;

    const scoring = await QuotationScoring.create(scoringData);
    await Promise.all(
      configurations.map((cfg: any) =>
        QuotationScoringConfiguration.create({
          quotation_scoring_id: scoring.id,
          ...cfg,
        })
      )
    );

    const result = await QuotationScoring.findByPk(scoring.id, {
      include: [{ model: QuotationScoringConfiguration, as: "configurations" }],
    });

    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Read (all + one)
export const getQuotationScorings = async (_req: Request, res: Response) => {
  try {
    const scorings = await QuotationScoring.findAll({
      include: [{ model: QuotationScoringConfiguration, as: "configurations" }],
    });
    res.json({ success: true, data: scorings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuotationScoringById = async (req: Request, res: Response) : Promise<void>=> {
  try {
    const scoring = await QuotationScoring.findByPk(req.params.id, {
      include: [{ model: QuotationScoringConfiguration, as: "configurations" }],
    });
    if (!scoring) res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: scoring });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update
export const updateQuotationScoring = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = updateScoringSchema.validate(req.body);
    if (error) {  res.status(400).json({ success: false, message: error.message }); return; }

    const { configurations, ...scoringData } = value;

    const scoring = await QuotationScoring.findByPk(req.params.id);
    if (!scoring) {  res.status(404).json({ success: false, message: "Not found" }); return; }

    await scoring.update(scoringData);

    if (configurations && configurations.length) {
      await Promise.all(
        configurations.map(async (cfg: any) => {
          if (cfg.id) {
            const existing = await QuotationScoringConfiguration.findByPk(cfg.id);
            if (existing) {
              return existing.update(cfg);
            }
          }
          return QuotationScoringConfiguration.create({
            quotation_scoring_id: scoring.id,
            ...cfg,
          });
        })
      );
    }

    const result = await QuotationScoring.findByPk(scoring.id, {
      include: [{ model: QuotationScoringConfiguration, as: "configurations" }],
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete
export const deleteQuotationScoring = async (req: Request, res: Response): Promise<void> => {
  try {
    const scoring = await QuotationScoring.findByPk(req.params.id);
    if (!scoring) {  res.status(404).json({ success: false, message: "Not found" }); return; }

    await scoring.destroy();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
