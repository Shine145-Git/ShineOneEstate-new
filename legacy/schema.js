const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  source: { type: String, enum: ["cloud", "local"], default: "cloud" },
  type: { type: String, enum: ["image", "video"], default: "image" },
});

const SectorSchema = new mongoose.Schema({
  name: String,                // "sec 42"
  displayName: String,         // "Sector 42"
  status: String,              // completed / ongoing
  area: String,
  progress: Number,
  eta: String,
  stage: String,
  description: String,
  subtitle: String,

  media: [MediaSchema],        // images/videos (cloud + local)

  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
});

const HeroSchema = new mongoose.Schema({
  titleMain: String,           // "We Build"
  titleDynamic: [String],      // ["Vision", "Dream", "Future"]
  tagline: String,
  subtext: String,
  carousel: [String],          // image URLs
  stats: [
    {
      value: String,
      label: String,
      icon: String,
    },
  ],
});

const OverviewSchema = new mongoose.Schema({
  heading: String,
  subheading: String,
  description: String,
});

const StorySchema = new mongoose.Schema({
  sector: String,              // "sec 42"
  media: [MediaSchema],
});

const GallerySchema = new mongoose.Schema({
  sector: String,
  media: [MediaSchema],
});

const LocationZoneSchema = new mongoose.Schema({
  name: String,
  icon: String,
  color: String,
  sectors: [String],
  description: String,
  highlights: [String],
  tag: String,
  tagColor: String,
});

const SiteContentSchema = new mongoose.Schema({
  siteName: String,
  tagline: String,
  location: String,

  hero: HeroSchema,

  overview: OverviewSchema,

  sectors: [SectorSchema],

  stories: [StorySchema],

  gallery: [GallerySchema],

  locations: [LocationZoneSchema],

  contact: {
    phone: String,
    whatsapp: String,
    email: String,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SiteContent", SiteContentSchema);