import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard/dashboard";
import LoginModal from "./screens/Login Page/login";
import RentalPropertydetails from "./screens/Property View/RentalPropertyPageView";
import SalePropertyPage from "./screens/Property View/SalePropertyPageView";
import PropertyCheckout from "./screens/Visit Schedule/Clientvist";
import TestUser from "./screens/Testing/test";
import AIAssistant from "./screens/AI Assistant/ai";
import PropertyListingForm from "./screens/Add property/Propertyadd";
import MyProperties from "./screens/Property View/RentalPropertyPageView";
import PropertyCards from "./screens/User-Properties/propertiesuser";
import Searchproperty from "./screens/Searches/Searchproperty";
import AdminDashboard from "./screens/Admin Page/admin.properties";
import RewardsPage from "./screens/Rewards/reward";
// import UserDetailsForm from "./screens/User Details/user";
import PricePredictor from "./screens/Price Predictor Model/pricepredict";
import CustomerSupportPage from "./screens/Customer Support/Customersupport";
import CallbackDetailsUI from "./screens/Admin Page/admin.customersupport";
import Chatbot from "./screens/Dashboard/ChatBot";
import AdminEnquiryProperties from "./screens/Admin Page/admin.enquiryproperties";
import SeeAllProperties from "./screens/Dashboard/SeeAllProperties";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginModal />} />
        {/* These two routes basically show the details page of the property by id */}
        <Route path="/Rentaldetails/:id" element={<RentalPropertydetails />} />
        <Route path="/Saledetails/:id" element={<SalePropertyPage />} />

        <Route path="/test" element={<TestUser />} />
        <Route path="/AIassistant" element={<AIAssistant />} />
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
        <Route path="/admin/properties" element={<AdminDashboard />} />
        <Route path="/support" element={<CustomerSupportPage />} />
        <Route path="/admin/enquiries" element={<AdminEnquiryProperties />} />
        <Route path="/admin/callback" element={<CallbackDetailsUI />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/seeAllproperties" element={<SeeAllProperties />} />
        

      </Routes>
    </Router>
  );
}

export default App;
