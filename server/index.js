import cors from "cors";
import express from "express";
import { getProfileCollection } from "./db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "8mb" }));

const buildDefaultProfile = ({ mobile, role, ...data }) => ({
  name: data.name || `${role || "User"} Profile`,
  mobile,
  email: data.email || "",
  location: data.location || "",
  businessName: data.businessName || "",
  businessType: data.businessType || role || "",
  image: data.image || "",
  about: data.about || "",
  specialty: data.specialty || "",
  availability: data.availability || "Available",
  role: role || data.businessType || "",
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/profiles/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const { role } = req.query;
    const profiles = await getProfileCollection();
    const profile = await profiles.findOne({ mobile });

    res.json(profile || buildDefaultProfile({ mobile, role }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/profiles", async (req, res) => {
  try {
    const profile = buildDefaultProfile(req.body);

    if (!profile.mobile) {
      res.status(400).json({ message: "Mobile number is required." });
      return;
    }

    const now = new Date();
    const profiles = await getProfileCollection();
    const result = await profiles.findOneAndUpdate(
      { mobile: profile.mobile },
      {
        $set: {
          ...profile,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/profiles/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const profile = buildDefaultProfile({ ...req.body, mobile });

    const profiles = await getProfileCollection();
    const result = await profiles.findOneAndUpdate(
      { mobile },
      {
        $set: {
          ...profile,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Profile API running on http://localhost:${port}`);
});
