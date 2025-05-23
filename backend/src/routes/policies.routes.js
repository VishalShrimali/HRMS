import express from "express";
import { Policy } from "../models/policy.models.js";

const router = express.Router();

// GET /api/leads/:leadId/policies - Get all policies sold by a lead
router.get("/leads/:leadId/policies", async (req, res) => {
  try {
    const policies = await Policy.find({ lead: req.params.leadId });
    res.json({ policies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leads/:leadId/policies - Add a new policy for a lead
router.post("/leads/:leadId/policies", async (req, res) => {
  try {
    const { policyType, amount, soldAt } = req.body;
    const policy = new Policy({
      lead: req.params.leadId,
      policyType,
      amount,
      soldAt: soldAt || Date.now()
    });
    await policy.save();
    res.status(201).json({ policy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 