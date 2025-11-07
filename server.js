import express from "express";
import cors from "cors";
import { scrapeBill } from "./scraper.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("PAKBILLCHECK API running. Use /api/bill"));

app.post("/api/bill", async (req, res) => {
  const { ref } = req.body;
  if(!ref) return res.status(400).json({ error: "Reference missing" });
  try {
    const billData = await scrapeBill(ref);
    res.json(billData);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
