// Central export file for all models
import User from "./User.js"
import InfluencerProfile from "./InfluencerProfile.js"
import BrandCampaign from "./BrandCampaign.js"
import Draft from "./Draft.js"

export { User, InfluencerProfile, BrandCampaign, Draft }

// Helper function to initialize all models
export const initializeModels = () => {
  // This ensures all models are registered with Mongoose
  return {
    User,
    InfluencerProfile,
    BrandCampaign,
    Draft,
  }
}
