import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { setupInterceptors } from "./utils/axiosInterceptor";
import Dashboard from "./screens/Dashboard/dashboard";
import LoginModal from "./screens/Login Page/login";
import RentalPropertydetails from "./screens/Property View/RentalPropertyPageView";
import SalePropertyPage from "./screens/Property View/SalePropertyPageView";
import PropertyCheckout from "./screens/Visit Schedule/Clientvist";

import PropertySearchInterface from "./screens/AI Assistant/ai";
import VoiceAssistantRent from "./screens/AI Assistant/RENTAL_CLIENT_RASA_MODEL";
import VoiceAssistantSale from "./screens/AI Assistant/SALE_CLIENT_RASA_MODEL";
import PropertyListingForm from "./screens/Add property/Propertyadd";
import MyProperties from "./screens/Property View/RentalPropertyPageView";
import PropertyCards from "./screens/User-Properties/propertiesuser";
import Searchproperty from "./screens/Searches/Searchproperty";
import AdminProperties from "./screens/Admin Page/admin.properties";
import RewardsPage from "./screens/Rewards/reward";
// import UserDetailsForm from "./screens/User Details/user";
import PricePredictor from "./screens/Price Predictor Model/pricepredict";
import CustomerSupportPage from "./screens/Customer Support/Customersupport";
import  CallbackRequestsDashboard from "./screens/Admin Page/admin.customersupport";
import Chatbot from "./screens/Dashboard/ChatBot";
import PaymentsRewardsDashboard from "./screens/Admin Page/admin.enquiryproperties";
import SeeAllProperties from "./screens/Dashboard/SeeAllProperties";
import PropertyAnalytics from "./screens/User-Properties/PropertyAnalysis";
import Savedproperties from "./screens/Dashboard/savedproperties";
import AdminDashboard from "./screens/Admin Page/admin.dashboardoverview";
import UserManagementSystem from "./screens/Admin Page/admin.usermanagement";
import AdminLandingPage from "./screens/Admin Page/LandingAdminPage";
import EnquiryPage from "./screens/Visit Schedule/enquiry";
import AboutPage from "./screens/Customer Support/About";
import AdminPropertyManager from "./screens/Admin Page/admin.propertyManager";
import AdminProtectedRoute from "./screens/Admin Page/AdminProtectedRoutes";
import AdminPropertyListingForm from "./screens/Admin Page/admin.addproperty";
import InvestRealEstatePage from "./screens/Dashboard/InvestinRealEstateCardSection";
import ServiceRequestApp from "./screens/Managed Services/CreateServices";
import ServiceTrackingSystem from "./screens/Managed Services/ManageServices";
import AdminServiceTracking from "./screens/Admin Page/admin.servicesDashboard";
import VoiceVirtualTourModal from "./screens/3D View Property/propview";
import CloudinaryDashboard from "./screens/Admin Page/admin.usageManager";
import AdminUsageDashboard from "./screens/Admin Page/admin.usageManager2";
import PropertyListingPage from "./screens/Admin Page/admin.allproperties";


function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginModal />} />
      {/* These two routes basically show the details page of the property by id */}
      <Route path="/Rentaldetails/:id" element={<RentalPropertydetails />} />
      <Route path="/Saledetails/:id" element={<SalePropertyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/AIassistant" element={<PropertySearchInterface />} />
      <Route path="/AIassistant-Rent" element={<VoiceAssistantRent />} />
      <Route path="/AIassistant-Sale" element={<VoiceAssistantSale />} />
      <Route path="/add-property" element={<PropertyListingForm />} />
      <Route path="/my-properties/:id" element={<MyProperties />} />
      {/* This property visit page show the client visit page i.e the enquiry and payment page */}
      <Route path="/property-visit/:id" element={<PropertyCheckout />} />

      <Route path="/my-properties" element={<PropertyCards />} />
      <Route path="/search" element={<Searchproperty />} />
      <Route path="/search/:query" element={<Searchproperty />} />
      <Route path="/rewards" element={<RewardsPage />} />
      {/* <Route path="/user-details" element={<UserDetailsForm />} /> */}
      <Route path="/price-predictor" element={<PricePredictor />} />
      <Route path="/investrealestate" element={<InvestRealEstatePage />} />

      
      <Route path="/admin/Landingpage" element={<AdminProtectedRoute element={<AdminLandingPage />} />} />
      <Route path="/admin/Dashboard" element={<AdminProtectedRoute element={<AdminDashboard />} />} />
      <Route path="/admin/UserManagement" element={<AdminProtectedRoute element={<UserManagementSystem />} />} />
      <Route path="/admin/enquiries" element={<AdminProtectedRoute element={<PaymentsRewardsDashboard />} />} />
      <Route path="/admin/callback" element={<AdminProtectedRoute element={<CallbackRequestsDashboard />} />} />
      <Route path="/admin/rewardsproperties" element={<AdminProtectedRoute element={<PropertyListingPage />} />} />
      <Route path="/admin/propertymanager" element={<AdminProtectedRoute element={<AdminPropertyManager />} />} />
      <Route path="/admin/add-property" element={<AdminProtectedRoute element={<AdminPropertyListingForm />} />} />
      <Route path="/admin/services" element={<AdminProtectedRoute element={<AdminServiceTracking />} />} />
      

      <Route path="/support" element={<CustomerSupportPage />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/seeAllproperties" element={<SeeAllProperties />} />
      <Route path="/savedproperties" element={<Savedproperties />} />
      <Route path="/property-analytics/:id" element={<PropertyAnalytics />} />
      <Route path="/enquiry-page/:id" element={<EnquiryPage />} />
      <Route path="/servicesCreate" element={<ServiceRequestApp />} />
      <Route path="/services" element={<ServiceTrackingSystem />} />
      <Route path="/property/:id/virtual-tour" element={<VoiceVirtualTourModal />} />
      <Route path="/admin/usagetrack" element={<CloudinaryDashboard />} />
      <Route path="/admin/usagetrack2" element={<AdminUsageDashboard />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
