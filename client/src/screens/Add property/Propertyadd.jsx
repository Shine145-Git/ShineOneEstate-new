import React, { useState, useRef } from "react";
import {
  Home,
  Building2,
  DollarSign,
  MapPin,
  FileText,
  Upload,
  Image,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";


export default function PropertyListingForm() {
  // --- Hooks at the top ---
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    purpose: "",
    address: "",
    Sector: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    totalArea: "",
    images: [],
    // Rental-specific fields
    layoutFeatures: "",
    appliances: [],
    conditionAge: "",
    renovations: "",
    parking: "",
    outdoorSpace: "",
    monthlyRent: "",
    leaseTerm: "",
    securityDeposit: "",
    otherFees: "",
    utilities: [],
    tenantRequirements: "",
    moveInDate: "",
    neighborhoodVibe: "",
    transportation: "",
    localAmenities: "",
    communityFeatures: [],
    petPolicy: "",
    smokingPolicy: "",
    maintenance: "",
    insurance: "",
    // Sale-specific fields
    title: "",
    description: "",
    price: "",
    location: "",
    Sector: "",
    area: "",
  });
  const [images, setImages] = useState([]);
  const imageInputRef = useRef();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  // --- Step definitions ---
  const getRentalSteps = () => [
    { title: "Property Details", icon: Home, color: "#003366" },
    { title: "Pricing", icon: DollarSign, color: "#00A79D" },
    { title: "Location", icon: MapPin, color: "#4A6A8A" },
    { title: "Policies", icon: FileText, color: "#22D3EE" },
    { title: "Photos", icon: Image, color: "#00A79D" },
  ];
  const getSaleSteps = () => [
    { title: "Property Details", icon: Home, color: "#003366" },
    { title: "Pricing & Info", icon: DollarSign, color: "#00A79D" },
    { title: "Photos", icon: Image, color: "#4A6A8A" },
  ];
  const steps = formData.purpose === "Sale" ? getSaleSteps() : getRentalSteps();

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Reset form on purpose change
    if (name === "purpose" && value !== formData.purpose) {
      setFormData({
        purpose: value,
        address: "",
        propertyType: "",
        bedrooms: "",
        bathrooms: "",
        totalArea: "",
        layoutFeatures: "",
        appliances: [],
        conditionAge: "",
        renovations: "",
        parking: "",
        outdoorSpace: "",
        monthlyRent: "",
        leaseTerm: "",
        securityDeposit: "",
        otherFees: "",
        utilities: [],
        tenantRequirements: "",
        moveInDate: "",
        neighborhoodVibe: "",
        transportation: "",
        localAmenities: "",
        communityFeatures: [],
        petPolicy: "",
        smokingPolicy: "",
        maintenance: "",
        insurance: "",
        title: "",
        description: "",
        price: "",
        location: "",
        area: "",
      });
      setImages([]);
      setCurrentStep(0);
      return;
    }
    if (type === "checkbox") {
      const array = formData[name] || [];
      setFormData({
        ...formData,
        [name]: checked ? [...array, value] : array.filter((v) => v !== value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  const handleSubmit = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => form.append(`${key}[]`, v));
        } else if (value !== undefined && value !== null && value !== "") {
          form.append(key, value);
        }
      });
      images.forEach((imgObj) => {
        if (imgObj.file) form.append("images", imgObj.file);
      });
      const url =
        formData.purpose === "Sale"
          ? `${process.env.REACT_APP_ADD_SALE_PROPERTY_API}`
          : `${process.env.REACT_APP_ADD_RENT_PROPERTY_API}`;
      const res = await fetch(url, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (res.ok) {
        alert("✅ Property successfully submitted!");
        navigate("/");
      } else {
        const err = await res.json();
        alert("❌ Submission failed: " + (err.message || res.statusText));
      }
    } catch (error) {
      alert("❌ Submission failed: " + error.message);
    }
  };

  // --- Styles ---
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#F4F7F9",
    padding: "0",
  };
  const headerStyle = {
    backgroundColor: "#003366",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };
  const logoStyle = {
    color: "#FFFFFF",
    fontSize: "28px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };
  const mainContentStyle = {
    display: "flex",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px",
    gap: "30px",
  };
  const sidebarStyle = {
    width: "280px",
    flexShrink: 0,
  };
  const sidebarCardStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 12px rgba(0,51,102,0.08)",
    marginBottom: "20px",
  };
  const sidebarTitleStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#003366",
    marginBottom: "20px",
  };
  const stepItemStyle = (index) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "8px",
    cursor: "pointer",
    backgroundColor: currentStep === index ? "#F4F7F9" : "transparent",
    transition: "all 0.3s",
    border:
      currentStep === index ? "2px solid #00A79D" : "2px solid transparent",
  });
  const stepIconStyle = (index) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor:
      currentStep === index
        ? steps[index].color
        : currentStep > index
        ? "#00A79D"
        : "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });
  const stepTextStyle = (index) => ({
    fontSize: "14px",
    fontWeight: currentStep === index ? "700" : "500",
    color: currentStep === index ? "#003366" : "#4A6A8A",
  });
  const formAreaStyle = {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 2px 12px rgba(0,51,102,0.08)",
  };
  const formTitleStyle = {
    fontSize: "32px",
    fontWeight: "800",
    color: "#003366",
    marginBottom: "10px",
  };
  const formSubtitleStyle = {
    fontSize: "16px",
    color: "#4A6A8A",
    marginBottom: "40px",
  };
  const inputLabelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333333",
    marginBottom: "8px",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
    minHeight: "100px",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  };
  const fieldStyle = {
    marginBottom: "25px",
  };
  const checkboxGroupStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
  };
  const checkboxLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "2px solid #E5E7EB",
    transition: "all 0.3s",
  };
  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "2px solid #F4F7F9",
  };
  const buttonStyle = (variant) => ({
    padding: "14px 32px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: variant === "primary" ? "#00A79D" : "#FFFFFF",
    color: variant === "primary" ? "#FFFFFF" : "#4A6A8A",
    border: variant === "secondary" ? "2px solid #E5E7EB" : "none",
  });
  const uploadAreaStyle = {
    border: "3px dashed #00A79D",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#F4F7F9",
    transition: "all 0.3s",
    cursor: "pointer",
  };
  const uploadedImagesStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "25px",
  };
  const uploadedImageStyle = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #E5E7EB",
  };

  // --- Step content rendering ---
  function renderPhotosStep() {
    return (
      <div>
        <h2 style={formTitleStyle}>Upload Photos</h2>
        <p style={formSubtitleStyle}>Add photos to showcase your property</p>
        <div
          style={uploadAreaStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00A79D")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#00A79D")}
          onClick={() => imageInputRef.current?.click()}
        >
          <Upload size={48} color="#00A79D" style={{ margin: "0 auto 15px" }} />
          <p style={{ color: "#003366", fontSize: "18px", fontWeight: "600", margin: "10px 0" }}>
            Click to upload or drag and drop
          </p>
          <p style={{ color: "#4A6A8A", fontSize: "14px", margin: 0 }}>
            PNG, JPG, GIF up to 10MB
          </p>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        {images.length > 0 && (
          <div>
            <p style={{ color: "#003366", fontWeight: "600", marginTop: "30px", marginBottom: "15px" }}>
              Uploaded Photos ({images.length})
            </p>
            <div style={uploadedImagesStyle}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img src={img.url} alt={`upload-${idx}`} style={uploadedImageStyle} />
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "#FF4444",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStepContent() {
    if (!formData.purpose) {
      return (
        <div>
          <h2 style={formTitleStyle}>Choose Property Purpose</h2>
          <p style={formSubtitleStyle}>
            Select whether you want to list your property for rent or sale
          </p>
          <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
            <div
              onClick={() => handleChange({ target: { name: "purpose", value: "Rent" } })}
              style={{
                flex: 1,
                padding: "40px",
                border: "3px solid #E5E7EB",
                borderRadius: "12px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                backgroundColor: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00A79D";
                e.currentTarget.style.backgroundColor = "#F4F7F9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <Home size={48} color="#00A79D" style={{ margin: "0 auto 20px" }} />
              <h3 style={{ color: "#003366", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
                For Rent
              </h3>
              <p style={{ color: "#4A6A8A", fontSize: "15px", margin: 0 }}>
                List your property for rental purposes with detailed amenities and policies
              </p>
            </div>
            <div
              onClick={() => handleChange({ target: { name: "purpose", value: "Sale" } })}
              style={{
                flex: 1,
                padding: "40px",
                border: "3px solid #E5E7EB",
                borderRadius: "12px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                backgroundColor: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00A79D";
                e.currentTarget.style.backgroundColor = "#F4F7F9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <DollarSign size={48} color="#00A79D" style={{ margin: "0 auto 20px" }} />
              <h3 style={{ color: "#003366", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
                For Sale
              </h3>
              <p style={{ color: "#4A6A8A", fontSize: "15px", margin: 0 }}>
                List your property for sale with pricing and description
              </p>
            </div>
          </div>
        </div>
      );
    }
    // RENTAL PROPERTY STEPS
    if (formData.purpose === "Rent") {
      switch (currentStep) {
        case 0:
          return (
            <div>
              <h2 style={formTitleStyle}>Property Details</h2>
              <p style={formSubtitleStyle}>
                Tell us about your rental property's basic information
              </p>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Property Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Sector *</label>
                <input
                  type="text"
                  name="Sector"
                  value={formData.Sector}
                  onChange={handleChange}
                  placeholder="e.g., Sector 46"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  >
                    <option value="">Select type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabelStyle}>Total Area (sqft) *</label>
                  <input
                    type="number"
                    name="totalArea"
                    value={formData.totalArea}
                    onChange={handleChange}
                    placeholder="e.g., 1200"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Bedrooms *</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>Bathrooms *</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Key Features</label>
                <textarea
                  name="layoutFeatures"
                  value={formData.layoutFeatures}
                  onChange={handleChange}
                  placeholder="Describe what makes your property special..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Appliances Included</label>
                <div style={checkboxGroupStyle}>
                  {[
                    "Refrigerator",
                    "Stove",
                    "Dishwasher",
                    "Washer/Dryer",
                    "Microwave",
                    "Air Conditioning",
                  ].map((app) => (
                    <label
                      key={app}
                      style={checkboxLabelStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#00A79D")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#E5E7EB")
                      }
                    >
                      <input
                        type="checkbox"
                        name="appliances"
                        value={app}
                        checked={(formData.appliances || []).includes(app)}
                        onChange={handleChange}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                          accentColor: "#00A79D",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: "#333333" }}>
                        {app}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Property Age</label>
                  <input
                    type="text"
                    name="conditionAge"
                    value={formData.conditionAge}
                    onChange={handleChange}
                    placeholder="e.g., Built in 2015"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>Parking</label>
                  <input
                    type="text"
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    placeholder="e.g., 2-car garage"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
            </div>
          );
        case 1:
          return (
            <div>
              <h2 style={formTitleStyle}>Pricing & Terms</h2>
              <p style={formSubtitleStyle}>
                Set your rental pricing and lease terms
              </p>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>Security Deposit (₹) *</label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="e.g., 100000"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Lease Term *</label>
                  <select
                    name="leaseTerm"
                    value={formData.leaseTerm}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  >
                    <option value="">Select term</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabelStyle}>Available From *</label>
                  <input
                    type="date"
                    name="moveInDate"
                    value={formData.moveInDate}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Utilities Included</label>
                <div style={checkboxGroupStyle}>
                  {["Electricity", "Water", "Gas", "Internet", "Maintenance"].map(
                    (util) => (
                      <label
                        key={util}
                        style={checkboxLabelStyle}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#00A79D")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#E5E7EB")
                        }
                      >
                        <input
                          type="checkbox"
                          name="utilities"
                          value={util}
                          checked={(formData.utilities || []).includes(util)}
                          onChange={handleChange}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "#00A79D",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#333333" }}>
                          {util}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Additional Fees</label>
                <textarea
                  name="otherFees"
                  value={formData.otherFees}
                  onChange={handleChange}
                  placeholder="Mention any additional fees (application fee, pet deposit, etc.)"
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Tenant Requirements</label>
                <textarea
                  name="tenantRequirements"
                  value={formData.tenantRequirements}
                  onChange={handleChange}
                  placeholder="e.g., Minimum credit score, proof of income, references..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div>
              <h2 style={formTitleStyle}>Location & Amenities</h2>
              <p style={formSubtitleStyle}>
                Highlight what makes your location special
              </p>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Neighborhood Description</label>
                <textarea
                  name="neighborhoodVibe"
                  value={formData.neighborhoodVibe}
                  onChange={handleChange}
                  placeholder="Describe the neighborhood vibe, safety, and lifestyle..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Transportation Access</label>
                <textarea
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  placeholder="Mention nearby metro, bus stops, highway access..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Local Amenities</label>
                <textarea
                  name="localAmenities"
                  value={formData.localAmenities}
                  onChange={handleChange}
                  placeholder="Schools, hospitals, shopping centers, restaurants nearby..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Community Features</label>
                <div style={checkboxGroupStyle}>
                  {[
                    "Swimming Pool",
                    "Fitness Center",
                    "Clubhouse",
                    "24/7 Security",
                    "Playground",
                    "Garden",
                    "Parking",
                  ].map((feat) => (
                    <label
                      key={feat}
                      style={checkboxLabelStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#00A79D")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#E5E7EB")
                      }
                    >
                      <input
                        type="checkbox"
                        name="communityFeatures"
                        value={feat}
                        checked={(formData.communityFeatures || []).includes(feat)}
                        onChange={handleChange}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                          accentColor: "#00A79D",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: "#333333" }}>
                        {feat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Outdoor Space</label>
                <input
                  type="text"
                  name="outdoorSpace"
                  value={formData.outdoorSpace}
                  onChange={handleChange}
                  placeholder="e.g., Private balcony, terrace, garden"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>
          );
        case 3:
          return (
            <div>
              <h2 style={formTitleStyle}>Policies & Rules</h2>
              <p style={formSubtitleStyle}>Set clear expectations for tenants</p>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Pet Policy *</label>
                  <select
                    name="petPolicy"
                    value={formData.petPolicy}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  >
                    <option value="">Select policy</option>
                    <option value="allowed">Pets Allowed</option>
                    <option value="not-allowed">No Pets</option>
                    <option value="restrictions">With Restrictions</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabelStyle}>Smoking Policy *</label>
                  <select
                    name="smokingPolicy"
                    value={formData.smokingPolicy}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  >
                    <option value="">Select policy</option>
                    <option value="allowed">Smoking Allowed</option>
                    <option value="not-allowed">No Smoking</option>
                    <option value="outdoor-only">Outdoor Only</option>
                  </select>
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Insurance Requirements</label>
                <select
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">Select requirement</option>
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                  <option value="not-required">Not Required</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>
                  Maintenance Responsibilities
                </label>
                <textarea
                  name="maintenance"
                  value={formData.maintenance}
                  onChange={handleChange}
                  placeholder="Clarify maintenance responsibilities between landlord and tenant..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Renovations History</label>
                <textarea
                  name="renovations"
                  value={formData.renovations}
                  onChange={handleChange}
                  placeholder="Recent renovations, upgrades, or improvements..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>
          );
        case 4:
          return renderPhotosStep();
        default:
          return null;
      }
    }
    // SALE PROPERTY STEPS
    if (formData.purpose === "Sale") {
      switch (currentStep) {
        case 0:
          return (
            <div>
              <h2 style={formTitleStyle}>Property Details</h2>
              <p style={formSubtitleStyle}>
                Provide essential information about your property for sale
              </p>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Luxurious 3BHK Villa in Prime Location"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Location/Address *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter complete address or location"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Sector *</label>
                <input
                  type="text"
                  name="Sector"
                  value={formData.Sector}
                  onChange={handleChange}
                  placeholder="e.g., Sector 46"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  >
                    <option value="">Select type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot/Land</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabelStyle}>Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., 2000"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={inputLabelStyle}>Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Property Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed description of the property, its features, condition, and unique selling points..."
                  style={textareaStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>
          );
        case 1:
          return (
            <div>
              <h2 style={formTitleStyle}>Pricing & Information</h2>
              <p style={formSubtitleStyle}>
                Set the sale price and additional details
              </p>
              <div style={fieldStyle}>
                <label style={inputLabelStyle}>Sale Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 5000000"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00A79D")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div
                style={{
                  marginTop: "40px",
                  padding: "25px",
                  backgroundColor: "#F4F7F9",
                  borderRadius: "8px",
                  borderLeft: "4px solid #00A79D",
                }}
              >
                <h4
                  style={{
                    color: "#003366",
                    fontSize: "18px",
                    fontWeight: "700",
                    margin: "0 0 15px 0",
                  }}
                >
                  Property Summary
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "15px",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Title</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.title || "Not provided"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Location</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.location || "Not provided"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Bedrooms</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.bedrooms || "Not specified"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Bathrooms</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.bathrooms || "Not specified"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Area</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.area || "Not specified"}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#4A6A8A", fontWeight: "600" }}>Price</p>
                    <p style={{ margin: 0, fontSize: "15px", color: "#003366" }}>{formData.price || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        case 2:
          return renderPhotosStep();
        default:
          return null;
      }
    }
    return null;
  }

  // --- Main render ---
  return (
    <div style={containerStyle}>
      <TopNavigationBar
          user={user}
          handleLogout={handleLogout}
          navItems={navItems}
        />
      <div style={mainContentStyle}>
        {/* Sidebar with steps */}
        {formData.purpose && (
          <div style={sidebarStyle}>
            <div style={sidebarCardStyle}>
              <h3 style={sidebarTitleStyle}>Progress</h3>
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={idx}
                    style={stepItemStyle(idx)}
                    onClick={() => setCurrentStep(idx)}
                  >
                    <div style={stepIconStyle(idx)}>
                      {currentStep > idx ? (
                        <Check size={20} color="#FFFFFF" />
                      ) : (
                        <StepIcon size={20} color="#FFFFFF" />
                      )}
                    </div>
                    <span style={stepTextStyle(idx)}>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Main Form Area */}
        <div style={formAreaStyle}>
          {renderStepContent()}
          {/* Navigation Buttons */}
          {formData.purpose && (
            <div style={buttonContainerStyle}>
              <button
                onClick={handlePrev}
                style={buttonStyle("secondary")}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>
              {currentStep === steps.length - 1 ? (
                <button onClick={handleSubmit} style={buttonStyle("primary")} >
                  Submit Property
                </button>
              ) : (
                <button onClick={handleNext} style={buttonStyle("primary")}>
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}