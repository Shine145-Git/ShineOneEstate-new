import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  Home,
  Users,
  Image as ImageIcon,
  X,
  ZoomIn,
  Menu,
} from "lucide-react";

const MailIconPlaceholder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M3 6.5C3 5.67 3.67 5 4.5 5H19.5C20.33 5 21 5.67 21 6.5V17.5C21 18.33 20.33 19 19.5 19H4.5C3.67 19 3 18.33 3 17.5V6.5Z" stroke="white" strokeWidth="1.2"/>
    <path d="M21 6L12 12.5L3 6" stroke="white" strokeWidth="1.2"/>
  </svg>
)

// responsive helper hook — returns true when viewport width <= 768px
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
};

const colors = {
  cream: "#EFECE3",
  lightBlue: "#8FABD4",
  darkBlue: "#4A70A9",
  black: "#000000",
};

const projectData = {
  id: 1,
  name: "ShineOneEstate",
  tagline: "Plots , Flats , Floors , Construction - We Build Your Vision",
  location: "Gurugram — Sector 4 • Sector 9 • Sector 46 • Sector 42",
  status: "Ongoing",
  progress: 78,
  units: "32 Premium Apartments",
  area: "15,000 sq.ft",
  possession: "Dec 2025",
  rera: "P51900052847",
  architect: "Studio Arch",
  priceRange: "₹2.5Cr - ₹4.8Cr",
  videoUrl: "https://example.com/video.mp4",
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  ],
  milestones: [
    { name: "Foundation", date: "Jan 2024", status: "completed" },
    { name: "Structure", date: "May 2024", status: "completed" },
    { name: "Finishing", date: "Nov 2024", status: "ongoing" },
    { name: "Handover", date: "Dec 2025", status: "pending" },
  ],
  dailyLog: [
    {
      date: "Nov 14, 2025",
      note: "Marble flooring installation in progress for units 201-204. Quality check completed.",
      images: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600",
      ],
    },
    {
      date: "Nov 13, 2025",
      note: "Electrical wiring inspection completed. All units passed safety standards.",
      images: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600",
      ],
    },
    {
      date: "Nov 12, 2025",
      note: "Waterproofing treatment applied to terrace areas. Curing in progress.",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
        "https://images.unsplash.com/photo-1503594384566-461fe158e797?w=600",
      ],
    },
  ],
  materials: [
    {
      name: "Cement",
      brand: "UltraTech",
      supplier: "BuildMart Suppliers",
      reason: "Superior strength & durability, ISI certified",
      image:
        "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400",
      cert: "ISO 9001:2015",
    },
    {
      name: "Steel",
      brand: "Tata Tiscon",
      supplier: "Steel Corporation",
      reason: "High tensile strength, corrosion resistant",
      image:
        "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400",
      cert: "BIS Certified",
    },
    {
      name: "Tiles",
      brand: "Kajaria Premium",
      supplier: "Tile World",
      reason: "Premium vitrified, stain resistant",
      image:
        "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400",
      cert: "ISO 9001",
    },
    {
      name: "Wiring",
      brand: "Polycab",
      supplier: "Electric Solutions",
      reason: "Fire retardant, ISI marked cables",
      image:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400",
      cert: "ISI Mark",
    },
    {
      name: "Pipes",
      brand: "Astral",
      supplier: "Plumbing Pro",
      reason: "Lead-free, 10 year warranty",
      image:
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400",
      cert: "ISI/ISO",
    },
    {
      name: "Waterproofing",
      brand: "Dr. Fixit",
      supplier: "Construction Chem",
      reason: "Advanced polymer technology",
      image:
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
      cert: "ASTM Approved",
    },
  ],
  stories: [],
  beforeAfter: {
    before: require("./data/beforeafter/After.jpeg"),
    after: require("./data/beforeafter/before.jpeg"),
  },
  floorPlans: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
  ],
  testimonials: [
    {
      name: "Rajesh Sharma",
      unit: "Unit 101",
      quote:
        "The transparency in construction process gave us complete peace of mind. Quality is exceptional!",
      video: "https://example.com/testimonial1.mp4",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    {
      name: "Priya Mehta",
      unit: "Unit 205",
      quote:
        "Daily updates and material transparency set ShineOneEstate apart. Truly professional!",
      video: "https://example.com/testimonial2.mp4",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
  ],
  team: [
    {
      name: "Ar. Vikram Desai",
      role: "Lead Architect",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
    {
      name: "Sunil Patil",
      role: "Site Manager",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    },
    {
      name: "Anita Kulkarni",
      role: "QA Engineer",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
    },
  ],
  neighbourhood: {
    lat: 28.4595,
    lng: 77.0266,
    nearby: [
      {
        name: 'Sector 4, Gurugram',
        distance: 'Central',
        type: 'Family-friendly residential sector',
        description: 'Calm, well-established neighbourhood with top schools, local markets and easy access to inner-Gurugram.',
        highlights: ['Top schools within 5–10 mins', 'Local groceries & weekly markets', 'Peaceful residential streets']
      },
      {
        name: 'Sector 9, Gurugram',
        distance: 'Well-connected',
        type: 'Transit-oriented sector',
        description: 'Rapidly improving connectivity with planned metro links and good road access — ideal for commuters.',
        highlights: ['Planned metro connectivity', 'Quick road links to business hubs', 'Growing service infrastructure']
      },
      {
        name: 'Sector 46, Gurugram',
        distance: 'Established',
        type: 'Community-focused sector',
        description: 'An established locale with busy community markets, healthcare centres and family amenities nearby.',
        highlights: ['Active community markets', 'Nearby clinics & pharmacies', 'Strong rental demand']
      },
      {
        name: 'Sector 42, Gurugram',
        distance: 'High-growth corridor',
        type: 'Emerging residential & investment zone',
        description: 'Located near the Dwarka Expressway corridor with new launches and strong appreciation potential.',
        highlights: ['Close to Dwarka Expressway', 'New residential launches', 'High appreciation potential']
      }
    ],
    activeSector: 0,
  },
  certificates: [
    { name: "Soil Test Report", date: "Jan 2024", file: "soil-test.pdf" },
    { name: "Structural Safety", date: "May 2024", file: "structural.pdf" },
    {
      name: "Waterproofing Certificate",
      date: "Oct 2024",
      file: "waterproof.pdf",
    },
  ],
  costTiers: [
    {
      name: "Basic",
      price: "₹2.5 - 3.0 Cr",
      features: ["Standard Flooring", "Basic Fixtures", "Simple Lighting"],
    },
    {
      name: "Standard",
      price: "₹3.5 - 4.0 Cr",
      features: ["Premium Tiles", "Modular Kitchen", "Designer Lighting"],
    },
    {
      name: "Premium",
      price: "₹4.5 - 4.8 Cr",
      features: [
        "Marble Flooring",
        "Italian Fixtures",
        "Smart Home",
        "Premium Appliances",
      ],
    },
  ],
  projects: [
    { name: 'Sector 4', status: 'Completed', area: '160 Sq. Yard' },
    { name: 'Sector 9', status: 'Completed', area: '160 Sq. Yard' },
    { name: 'Sector 46', status: 'Completed', area: '100 Sq. Yard' },
    { name: 'Sector 42', status: 'Ongoing', area: '80 Sq. Yard' }
  ],
};
// Auto-generate stories and load all images and videos from src/data grouped per folder
(function generateStoriesFromDataFolders(){
  let generatedStories = [];
  try {
    // require images and videos from src/data and subfolders
    const ctx = require.context('./data', true, /\.(png|jpe?g|webp|gif|mp4|webm|ogg)$/i);
    const keys = ctx.keys(); // e.g. ['./sec 4/img1.jpg', './sec 9/video.mp4']
    const folderImages = {}; // { 'sec 4': [url1, url2], 'sec 9': [url3] }

    keys.forEach((k) => {
      const clean = k.replace(/^\.\//, '');
      const parts = clean.split('/');
      if (parts.length >= 2) {
        const folder = parts[0];
        if (!folderImages[folder]) folderImages[folder] = [];
        try { folderImages[folder].push(ctx(k)); } catch(e) { /* ignore resolution errors */ }
      }
    });

    // store mapping on projectData so other components can use all media
    projectData.folderImages = folderImages;

    // create stories from folder names (use first media per folder for story thumbnail)
    const folderNames = Object.keys(folderImages);
    if (folderNames.length) {
      const folders = folderNames.sort((a,b)=>{
        const na = (a.match(/\d+/)||[])[0]||0;
        const nb = (b.match(/\d+/)||[])[0]||0;
        return Number(na)-Number(nb);
      });
      generatedStories = folders.map(folder => ({
        week: folder,
        date: '',
        title: folder,
        image: (folderImages[folder] && folderImages[folder][0]) || projectData.images[0]
      }));
    }
  } catch (e) {
    // require.context may not be available in some environments; ignore and fallback below
  }

  if (!generatedStories.length) {
    // fallback: create simple stories from projects
    generatedStories = projectData.projects.map(p => ({ week: p.name, date: '', title: p.name, image: projectData.images[0] }));
    projectData.folderImages = projectData.folderImages || {};
  }

  projectData.stories = generatedStories;
})();
const VideoSection = () => {
  const isMobile = useIsMobile();
  const folderImages = projectData.folderImages || {};
  const desired = ['sec 4','sec 9','sec 46','sec 42'];
  const keys = Object.keys(folderImages || {});
  const isVideo = (src) => /\.(mp4|webm|ogg)$/i.test(String(src));

  // find folders that match desired and that actually contain at least one video
  const matched = desired.map(d => keys.find(k => k.toLowerCase() === d)).filter(Boolean);
  const allFolders = matched.filter(folder => (folderImages[folder] || []).some(isVideo));

  const [player, setPlayer] = useState({ open: false, src: '', folder: '' });
  const openVideo = (folder, src) => setPlayer({ open: true, src, folder });
  const closeVideo = () => setPlayer({ open: false, src: '', folder: '' });

  return (
    <div style={{ padding: isMobile ? '20px 12px' : '36px 20px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, color: colors.darkBlue, textAlign: 'center', marginBottom: 12 }}>Project Videos</h2>
        {allFolders.length === 0 && <div style={{ textAlign: 'center', color: colors.black }}>No videos found.</div>}

        {allFolders.map(folder => (
          <div key={folder} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, color: colors.black, marginBottom: 8 }}>{folder}</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {(folderImages[folder] || []).filter(isVideo).map((src, idx) => (
                <div key={idx} style={{ minWidth: isMobile ? 200 : 280, height: isMobile ? 120 : 160, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#000', position: 'relative' }} onClick={() => openVideo(folder, src)}>
                  <video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                  <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '6px 8px', borderRadius: 6, fontSize: 12 }}>Play</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {player.open && (
          <div onClick={closeVideo} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
            <div style={{ maxWidth: isMobile ? '95%' : 1000, width: '90%', position: 'relative' }} onClick={(e)=>e.stopPropagation()}>
              <video src={player.src} controls autoPlay style={{ width: '100%', height: 'auto', borderRadius: 12 }} />

              {/* prominent close button inside player */}
              <button onClick={closeVideo} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color={colors.black} />
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Hero = () => {
  const isMobile = useIsMobile();
  // try to use images from src/data/Caraousel if available
  const carousel = (projectData.folderImages && (projectData.folderImages['Caraousel'] || projectData.folderImages['caraousel'])) || projectData.images;
  const [currentImage, setCurrentImage] = useState(0);
  useEffect(() => {
    if (!carousel || !carousel.length) return;
    const timer = setInterval(
      () => setCurrentImage((prev) => (prev + 1) % carousel.length),
      2500
    );
    return () => clearInterval(timer);
  }, [carousel]);

  const bg = carousel && carousel.length ? carousel[currentImage] : projectData.images[0];

  return (
    <div style={{ position: 'relative', height: isMobile ? '52vh' : '70vh', overflow: 'hidden', background: colors.black }}>

      {/* Blurred background layer (zoomed slightly) */}
      <img
        src={bg}
        alt="Hero background"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(14px) brightness(0.45)',
          transform: 'scale(1.08)',
        }}
      />

      {/* Dim overlay to improve contrast */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))' }} />

      {/* TOP BAR: LEFT — Title + Tagline | RIGHT — Buttons */}
      <div style={{ 
        position: 'absolute', 
        top: 12, 
        left: 0, 
        right: 0, 
        zIndex: 6, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: isMobile ? '8px 14px' : '0 28px',
        pointerEvents: 'none'
      }}>
        
        {/* LEFT SIDE: Large Project Title */}
        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ color: colors.cream, fontSize: isMobile ? '1.6rem' : '3rem', fontWeight: 900, letterSpacing: 0.6, lineHeight: 1 }}>
            {projectData.name}
          </div>
          <div style={{ color: colors.cream, opacity: 0.95, fontSize: isMobile ? '0.85rem' : '1.05rem', fontWeight: 700, marginTop: 4 }}>
            {projectData.tagline}
          </div>
        </div>

        {/* RIGHT SIDE: CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, pointerEvents: 'auto' }}>
          <a href="tel:+919310994032" style={{ textDecoration: 'none' }}>
            <button style={{ background: colors.darkBlue, color: colors.cream, padding: isMobile ? '8px 10px' : '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
              <Phone size={isMobile ? 14 : 16} /> Call
            </button>
          </a>

          <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#25D366', color: '#fff', padding: isMobile ? '8px 10px' : '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
              <MessageCircle size={isMobile ? 14 : 16} /> WhatsApp
            </button>
          </a>

          <a href="mailto:parveen@shineoneestate.co.in" style={{ textDecoration: 'none' }}>
            <button style={{ background: colors.lightBlue, color: colors.black, padding: isMobile ? '8px 10px' : '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
              <MailIconPlaceholder /> Email
            </button>
          </a>
        </div>
      </div>

      {/* Foreground carousel image (zoomed OUT / contained) */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: isMobile ? '95%' : '85%', maxWidth: 980, borderRadius: 14, overflow: 'hidden', boxShadow: '0 18px 48px rgba(0,0,0,0.5)', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 12 : 20  }}>
                <img
                  src={bg}
                  alt="carousel-foreground"
                  style={{ width: '100%', height: isMobile ? '260px' : '420px', objectFit: 'contain', objectPosition: 'center', background: 'transparent' }}
                />
              </div>
            </div>
          </div>

          {/* small dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {(carousel || projectData.images).map((_, idx) => (
              <div key={idx} onClick={() => setCurrentImage(idx)} style={{ width: isMobile ? 8 : 10, height: isMobile ? 8 : 10, borderRadius: '50%', background: idx === currentImage ? colors.lightBlue : 'rgba(255,255,255,0.6)', cursor: 'pointer', boxShadow: idx === currentImage ? '0 6px 18px rgba(74,112,169,0.28)' : 'none' }} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

const QuickSnapshot = () => {
  const isMobile = useIsMobile();
  const completedProjects = projectData.projects.filter(p => p.status.toLowerCase().includes('completed')).length;
  const ongoingProjects = projectData.projects.filter(p => p.status.toLowerCase().includes('ongoing')).length;
  const completedAreaTotal = projectData.projects
    .filter(p => p.status.toLowerCase().includes('completed'))
    .reduce((s, p) => {
      const num = parseInt(String(p.area).replace(/[^0-9]/g, '')) || 0;
      return s + num;
    }, 0);

  return (
    <section style={{ padding: isMobile ? '28px 12px' : '48px 20px', background: colors.cream }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12 }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.9rem', margin: 0, fontWeight: 800, color: colors.darkBlue }}>Projects Overview</h2>
            <p style={{ margin: '6px 0 0', color: colors.black, opacity: 0.8 }}>A concise summary of completed and ongoing projects — showing only the essential facts.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: isMobile ? 12 : 0, flexWrap: 'wrap' }}>
            {[{
              icon: <Home size={20} color={colors.darkBlue} />,
              label: 'Completed',
              value: completedProjects
            },{
              icon: <Clock size={20} color={colors.darkBlue} />,
              label: 'Ongoing',
              value: ongoingProjects
            },{
              icon: <Award size={20} color={colors.darkBlue} />,
              label: 'Completed Area',
              value: `${completedAreaTotal} Sq. Yard`
            }].map((c, i) => (
              <div key={i} style={{ background: 'white', padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                {c.icon}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: colors.black, fontWeight: 700 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: colors.darkBlue, opacity: 0.9 }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {projectData.projects.map((p, idx) => (
            <div key={idx} style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(245,247,250,1))', borderRadius: 12, padding: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: colors.darkBlue }}>{p.name}</div>
                <div style={{ fontSize: 13, color: colors.black, opacity: 0.8, marginTop: 6 }}>{p.status} • <span style={{ fontWeight: 700 }}>{p.area}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ padding: '6px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12, color: p.status.toLowerCase().includes('completed') ? '#016936' : '#7a5d00', background: p.status.toLowerCase().includes('completed') ? '#e6fff0' : '#fff8e1' }}>
                  {p.status.toUpperCase()}
                </div>
                {p.status.toLowerCase().includes('ongoing') && (
                  <div style={{ marginTop: 8, fontSize: 12, color: colors.darkBlue, opacity: 0.9 }}>ETA: {projectData.possession}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProgressTimeline = () => {
  const isMobile = useIsMobile();
  const [selectedProjectName, setSelectedProjectName] = useState(projectData.projects[0].name);
  const project = projectData.projects.find(p => p.name === selectedProjectName) || projectData.projects[0];
  const progress = project.progress !== undefined ? project.progress : (project.status.toLowerCase().includes('completed') ? 100 : 78);
  const stages = ['Foundation','Structure','Finishing','Interior Works','Final Inspection','Handover'];
  const stageStatuses = stages.map((s, idx) => {
    if (project.status.toLowerCase().includes('completed')) return 'completed';
    if (project.status.toLowerCase().includes('ongoing')) {
      if (s === 'Finishing') return 'ongoing';
      const finishingIndex = stages.indexOf('Finishing');
      if (idx < finishingIndex) return 'completed';
      return 'pending';
    }
    return 'pending';
  });

  return (
    <div style={{ padding: isMobile ? '28px 16px' : "28px 16px", background: "white" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: isMobile ? '1.4rem' : "2rem", fontWeight: 700, color: colors.black, marginBottom: 12, textAlign: 'center' }}>Construction Progress</h2>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', marginBottom: 18, gap: 12, alignItems: 'center' }}>
          <label style={{ fontWeight: 600, color: colors.darkBlue }}>Select Project:</label>
          <select value={selectedProjectName} onChange={(e) => setSelectedProjectName(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.darkBlue}` }}>
            {projectData.projects.map((p, i) => (
              <option key={i} value={p.name}>{p.name} — {p.status}</option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: isMobile ? '1.6rem' : '2.4rem', fontWeight: 800, color: colors.darkBlue }}>{progress}%</div>
          <div style={{ fontSize: '0.85rem', color: colors.black, opacity: 0.7 }}>Overall Completion</div>
        </div>

        <div style={{ height: 14, background: colors.cream, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${colors.lightBlue}, ${colors.darkBlue})`, width: `${progress}%`, transition: 'width 0.8s' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {stages.map((stage, idx) => {
            const status = stageStatuses[idx];
            const bg = status === 'completed' ? '#e6fff0' : status === 'ongoing' ? '#fff8e1' : 'rgba(255,255,255,0.9)';
            const color = status === 'completed' ? '#016936' : status === 'ongoing' ? '#7a5d00' : colors.darkBlue;
            return (
              <div key={stage} style={{ padding: 12, borderRadius: 10, background: bg, boxShadow: '0 6px 18px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color }}>{stage}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: colors.black, opacity: 0.8 }}>
                  {status === 'completed' ? 'Completed' : status === 'ongoing' ? 'In Progress' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};



const StoriesViewer = () => {
  const isMobile = useIsMobile();
  const folderImages = projectData.folderImages || {};
  const [openStory, setOpenStory] = useState({ open: false, folder: '', images: [], idx: 0 });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(4000);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchRef = React.useRef({ startX: 0, endX: 0 });
  const animTimer = React.useRef(null);
  const rafRef = React.useRef(null);

  const DEFAULT_DURATION = 4000;

  const isVideo = (src) => /\.(mp4|webm|ogg)$/i.test(src);

  const open = (folder) => {
    const imgs = folderImages[folder] || [];
    if (!imgs.length) return;
    setOpenStory({ open: true, folder, images: imgs, idx: 0 });
    setProgress(0);
    setIsPaused(false);
    setCurrentDuration(DEFAULT_DURATION);
  };

  const close = () => {
    setOpenStory({ open: false, folder: '', images: [], idx: 0 });
    setProgress(0);
    setIsPaused(false);
    setCurrentDuration(DEFAULT_DURATION);
  };

  // helper to change index with a short fade animation
  const showIndex = (newIdx) => {
    if (!openStory.open) return;
    // clamp
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= openStory.images.length) return close();
    setIsAnimating(true);
    // short fade-out then switch image then fade-in
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      setOpenStory((s) => ({ ...s, idx: newIdx }));
      setProgress(0);
      setIsAnimating(false);
    }, 180); // 180ms fade
  };

  const next = () => {
    if (!openStory.open) return;
    const nextIdx = openStory.idx + 1;
    if (nextIdx >= openStory.images.length) return close();
    showIndex(nextIdx);
  };
  const prev = () => {
    if (!openStory.open) return;
    const prevIdx = openStory.idx - 1;
    if (prevIdx < 0) {
      // restart current
      setProgress(0);
      return;
    }
    showIndex(prevIdx);
  };

  // auto-progress using currentDuration which may change for videos
  useEffect(() => {
    if (!openStory.open || isPaused) return;
    // cancel previous
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = Date.now();
    const run = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / currentDuration);
      setProgress(p);
      if (p >= 1) {
        next();
      } else {
        rafRef.current = requestAnimationFrame(run);
      }
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openStory.open, openStory.idx, isPaused, currentDuration]);

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // touch/swipe handlers
  const handleTouchStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchRef.current.startX = x;
    setIsPaused(true);
  };
  const handleTouchMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchRef.current.endX = x;
  };
  const handleTouchEnd = (e) => {
    const { startX, endX } = touchRef.current;
    const dx = endX - startX;
    // threshold
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev(); else next();
    }
    touchRef.current.startX = 0;
    touchRef.current.endX = 0;
    setIsPaused(false);
  };

  // When a video loads, set duration and reset progress
  const handleVideoMeta = (ev) => {
    const dur = ev.target.duration || 0;
    if (dur > 0) setCurrentDuration(dur * 1000);
    else setCurrentDuration(DEFAULT_DURATION);
    setProgress(0);
  };

  // when video ends, move next
  const handleVideoEnd = () => next();

  const tap = (e) => {
    // prevent tapping from interfering with buttons
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    if (x < rect.width / 2) prev(); else next();
  };

  return (
    <div style={{ padding: '60px 20px', background: colors.cream }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 30 }}>Project Stories</h2>

        {/* THUMBNAILS */}
        <div style={{ display: 'flex', gap: 15, overflowX: 'auto', paddingBottom: 8 }}>
          {['sec 4','sec 9','sec 46','sec 42']
            .map(d => Object.keys(folderImages).find(k => k.toLowerCase() === d))
            .filter(Boolean)
            .map(folder => (
              <div key={folder} style={{ textAlign: 'center', cursor: 'pointer', minWidth: 120 }} onClick={() => open(folder)}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${colors.darkBlue}`, margin: '0 auto 8px' }}>
                  <img src={folderImages[folder][0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, color: colors.black }}>{folder}</div>
              </div>
            ))}
        </div>

        {/* FULLSCREEN VIEWER */}
        {openStory.open && (
          <div
            onClick={tap}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* PROGRESS BAR ROW */}
            <div style={{ position: 'absolute', top: 18, left: 12, right: 12, display: 'flex', gap: 6 }}>
              {openStory.images.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.35)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: i < openStory.idx ? '100%' : i === openStory.idx ? `${progress * 100}%` : '0%', background: 'white', transition: 'width 120ms linear' }} />
                </div>
              ))}
            </div>

            {/* TOP INFO (title + count) */}
            <div style={{ position: 'absolute', top: 26, left: 18, display: 'flex', alignItems: 'center', gap: 12, color: 'white' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(255,255,255,0.85)` }}>
                <img src={openStory.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700 }}>{openStory.folder}</div>
              <div style={{ opacity: 0.9, marginLeft: 8 }}>{openStory.idx + 1}/{openStory.images.length}</div>
            </div>

            {/* IMAGE / VIDEO container with fade animation */}
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div style={{ transition: 'opacity 180ms ease', opacity: isAnimating ? 0 : 1, maxWidth: '90%', maxHeight: '90%', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideo(openStory.images[openStory.idx]) ? (
                  <video
                    key={openStory.images[openStory.idx]}
                    src={openStory.images[openStory.idx]}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                    playsInline
                    muted
                    autoPlay
                    onLoadedMetadata={handleVideoMeta}
                    onEnded={handleVideoEnd}
                  />
                ) : (
                  <img
                    key={openStory.images[openStory.idx]}
                    src={openStory.images[openStory.idx]}
                    alt={`story-${openStory.idx}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onLoad={() => setCurrentDuration(DEFAULT_DURATION)}
                  />
                )}
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button onClick={(e)=>{ e.stopPropagation(); close(); }} style={{ position: 'absolute', top: 18, right: 18, background: 'white', borderRadius: '50%', border: 'none', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={22} color={colors.black} />
            </button>

            {/* NAV HINTS (left/right) - visible on desktop */}
            <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: '40%', cursor: 'pointer' }} onClick={(e)=>{ e.stopPropagation(); prev(); }} />
            <div style={{ position: 'absolute', right: 6, top: 0, bottom: 0, width: '40%', cursor: 'pointer' }} onClick={(e)=>{ e.stopPropagation(); next(); }} />

          </div>
        )}
      </div>
    </div>
  );
};

const ImageGallery = () => {
  const isMobile = useIsMobile();
  const [lightbox, setLightbox] = useState({ open: false, src: '', folder: '' });
  const folderImages = projectData.folderImages || {};
  // show only these four folders (case-insensitive) and preserve this order
  const desired = ['sec 4', 'sec 9', 'sec 46', 'sec 42'];
  const keys = Object.keys(folderImages || {});
  const allFolders = desired.map(d => keys.find(k => k.toLowerCase() === d)).filter(Boolean);

  const openImage = (folder, src) => setLightbox({ open: true, src, folder });
  const close = () => setLightbox({ open: false, src: '', folder: '' });

  return (
    <div style={{ padding: isMobile ? '20px 12px' : '40px 20px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, color: colors.darkBlue, textAlign: 'center', marginBottom: 16 }}>Photo Gallery</h2>
        {allFolders.length === 0 && <div style={{ textAlign: 'center', color: colors.black }}>No images found in <code>src/data</code>.</div>}
        {allFolders.map((folder) => (
          <div key={folder} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, color: colors.black, marginBottom: 8 }}>{folder}</div>
            <div style={{ display: 'flex', gap: 8, overflowX: isMobile ? 'auto' : 'auto', paddingBottom: 8 }}>
              {folderImages[folder].map((src, idx) => (
                <div key={idx} style={{ minWidth: isMobile ? 120 : 150, height: isMobile ? 80 : 100, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }} onClick={() => openImage(folder, src)}>
                  <img src={src} alt={`${folder}-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {lightbox.open && (
          <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div style={{ maxWidth: isMobile ? '95%' : 1000, width: '90%', position: 'relative' }}>
              <img src={lightbox.src} alt={lightbox.folder} style={{ width: '100%', height: 'auto', borderRadius: 12 }} />
              <button onClick={(e)=>{ e.stopPropagation(); close(); }} style={{ position: 'absolute', top: 12, right: 12, background: 'white', border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer' }}>
                <X size={20} color={colors.black} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CollageDesigner = () => {
  const isMobile = useIsMobile();
  const folderImages = projectData.folderImages || {};
  const desired = ['sec 4','sec 9','sec 46','sec 42'];
  const keys = Object.keys(folderImages || {});
  const allowed = desired.map(d => keys.find(k => k.toLowerCase() === d)).filter(Boolean);
  const allImages = allowed.map(f => folderImages[f]).flat();
  const collageImages = allImages.slice(0, 8);

  return (
    <div style={{ padding: isMobile ? '24px 12px' : '40px 20px', background: colors.cream }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, color: colors.darkBlue, textAlign: 'center', marginBottom: 16 }}>Auto Collages & Designs</h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* collage style 1: 2x2 grid */}
          <div style={{ background: 'white', padding: 10, borderRadius: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
              {Array.from({length:4}).map((_, i) => (
                <div key={i} style={{ height: isMobile ? 110 : 160, overflow: 'hidden', borderRadius: 8 }}>
                  <img src={collageImages[i] || projectData.images[i % projectData.images.length]} alt={`col-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontWeight: 700, color: colors.darkBlue }}>Classic 2×2 Collage</div>
          </div>

          {/* collage style 2: mosaic */}
          <div style={{ background: 'white', padding: 10, borderRadius: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gridTemplateRows: isMobile ? 'auto auto' : 'repeat(2, 1fr)', gap: 8, height: isMobile ? 'auto' : 332 }}>
              <div style={{ gridRow: isMobile ? 'auto' : '1 / span 2', overflow: 'hidden', borderRadius: 8, height: isMobile ? 180 : '100%' }}>
                <img src={collageImages[0] || projectData.images[0]} alt='big' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ overflow: 'hidden', borderRadius: 8, height: isMobile ? 110 : 'auto' }}><img src={collageImages[1] || projectData.images[1]} alt='m1' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ overflow: 'hidden', borderRadius: 8, height: isMobile ? 110 : 'auto' }}><img src={collageImages[2] || projectData.images[2]} alt='m2' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
            <div style={{ marginTop: 10, fontWeight: 700, color: colors.darkBlue }}>Mosaic Highlight</div>
          </div>
        </div>

        {/* simple strip of remaining images */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {collageImages.slice(4).map((src, i) => (
            <div key={i} style={{ minWidth: isMobile ? 140 : 180, height: isMobile ? 90 : 120, borderRadius: 8, overflow: 'hidden' }}>
              <img src={src} alt={`strip-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BeforeAfterSlider = () => {
  const isMobile = useIsMobile();
  const [position, setPosition] = useState(50);
  return (
    <div style={{ padding: "60px 20px", background: "white" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: colors.black,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Before & After
        </h2>
        {/* Enhanced blurred background for depth */}
        <div
          style={{
            position: "relative",
            maxWidth: "900px",
            margin: "0 auto",
            height: isMobile ? '360px' : '520px',
            overflow: "hidden",
            borderRadius: "16px",
            backgroundImage: `url(${projectData.images[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(12px) brightness(0.45)",
            transform: 'scale(1.03)',
          }}
        />
        {/* Overlay container with increased blur */}
        <div
          style={{
            position: "relative",
            maxWidth: "900px",
            margin: "0 auto",
            height: isMobile ? '360px' : '520px',
            borderRadius: "16px",
            overflow: "hidden",
            marginTop: isMobile ? '-360px' : '-520px',
            backdropFilter: "blur(8px)",
          }}
        >
          {/* dim overlay so before/after images stand out */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 0 }} />

          {/* Main content area (keeps images centered) */}
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1 }}>

            {/* BEFORE image (fits fully) */}
            <img
              src={projectData.beforeAfter.before}
              alt="Before"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: 'center',
                zIndex: 1,
              }}
            />

            {/* CLIPPED AFTER image (moves left using objectPosition) */}
            <div
              style={{
                position: "absolute",
                width: `${position}%`,
                height: "100%",
                overflow: "hidden",
                zIndex: 2,
              }}
            >
              <img
                src={projectData.beforeAfter.after}
                alt="After"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </div>

            {/* range slider on top */}
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                cursor: "pointer",
                zIndex: 3,
              }}
            />

            {/* labels */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                background: colors.black,
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                zIndex: 3,
              }}
            >
              BEFORE
            </div>
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: colors.darkBlue,
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "600",
                zIndex: 3,
              }}
            >
              AFTER
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




const TeamSection = () => {
  const isMobile = useIsMobile();
  return (
    <div style={{ padding: isMobile ? '36px 12px' : '60px 20px', background: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '700', color: colors.black, marginBottom: '24px', textAlign: 'center' }}>Meet The Team</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: isMobile ? 18 : 30, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: isMobile ? 320 : 420 }}>
            <img
              src={require("./data/Profile/my_img.jpeg")}
              alt="Parveen Chawla"
              style={{
                width: isMobile ? 110 : 140,
                height: isMobile ? 110 : 140,
                borderRadius: "50%",
                objectFit: "cover",
                margin: "0 auto 12px",
                border: `4px solid ${colors.lightBlue}`,
              }}
            />
            <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800, color: colors.black, marginBottom: 6 }}>{'Parveen Chawla'}</h3>
            <div style={{ fontSize: '1rem', color: colors.black, marginBottom: 6 }}>Phone: <a href="tel:9310994032" style={{ color: colors.darkBlue, fontWeight: 700, textDecoration: 'none' }}>+91 93109 94032</a></div>
            <div style={{ fontSize: '1rem', color: colors.black }}>Email: <a href="mailto:parveen@shineoneestate.co.in" style={{ color: colors.darkBlue, fontWeight: 700, textDecoration: 'none' }}>parveen@shineoneestate.co.in</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapSection = () => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectors = projectData.neighbourhood.nearby;
  const active = sectors[activeIndex];

  return (
    <div style={{ padding: "80px 20px", background: colors.cream }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "2.8rem",
            fontWeight: "800",
            color: colors.black,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Location & Neighbourhood
        </h2>

        {/* SECTOR SWITCH BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: isMobile ? '18px' : '30px',
          }}
        >
          {sectors.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                padding: "10px 20px",
                borderRadius: "30px",
                border: "2px solid " + colors.darkBlue,
                background: i === activeIndex ? colors.darkBlue : "white",
                color: i === activeIndex ? "white" : colors.darkBlue,
                cursor: "pointer",
                fontWeight: "700",
                transition: "0.3s",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: "40px",
            alignItems: "stretch",
          }}
        >
          {/* LEFT SIDE: Map / Summary */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: isMobile ? '16px' : '30px',
              boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 30% 20%, rgba(74,112,169,0.18), transparent 70%)",
                zIndex: 0,
              }}
            />

            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: colors.darkBlue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                zIndex: 1,
              }}
            >
              <MapPin size={48} color="white" />
            </div>

            <h3
              style={{
                fontWeight: "800",
                fontSize: "1.8rem",
                color: colors.black,
                zIndex: 1,
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {active.name}
            </h3>

            <p
              style={{
                fontSize: "1rem",
                color: colors.darkBlue,
                opacity: 0.9,
                textAlign: "center",
                maxWidth: "90%",
                zIndex: 1,
              }}
            >
              {active.description}
            </p>

            <div
              style={{
                marginTop: "30px",
                width: "100%",
                height: isMobile ? '140px' : '220px',
                borderRadius: "14px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                zIndex: 1,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000"
                alt="map"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.7) saturate(0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  background: colors.darkBlue,
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                View Map
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Highlights */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {active.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  padding: "22px 26px",
                  borderRadius: "14px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: colors.darkBlue,
                    marginBottom: "8px",
                  }}
                >
                  {h}
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: colors.black,
                    opacity: 0.8,
                  }}
                >
                  Benefit of {active.name}: {h}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const StickyCTA = () => {
  const isMobile = useIsMobile();
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: colors.black, padding: isMobile ? '10px' : '15px 20px', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
      <a href="tel:+919310994032" style={{ textDecoration: 'none', flex: isMobile ? '0 1 100%' : '1', minWidth: '120px' }}>
        <button style={{ background: colors.darkBlue, color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', width: '100%' }}>
          <Phone size={18} /> Call
        </button>
      </a>

      <a href="https://wa.me/919310994032" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: isMobile ? '0 1 100%' : '1', minWidth: '120px' }}>
        <button style={{ background: '#25D366', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', width: '100%' }}>
          <MessageCircle size={18} /> WhatsApp
        </button>
      </a>

      <a href="mailto:parveen@shineoneestate.co.in" style={{ textDecoration: 'none', flex: isMobile ? '0 1 100%' : '1', minWidth: '120px' }}>
        <button style={{ background: colors.lightBlue, color: colors.black, padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', width: '100%' }}>
          <MailIconPlaceholder /> Email
        </button>
      </a>
    </div>
  );
};

const Footer = () => {
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: colors.black, color: colors.cream, padding: isMobile ? '40px 12px 80px' : '60px 20px 100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '12px', color: colors.lightBlue }}>ShineOne</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.8 }}>Building trust through transparency. Quality construction with complete visibility.</p>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', color: colors.lightBlue }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{['Home','Projects','About Us','Contact','Blog'].map((l,i)=>(<a key={i} href="#" style={{ color: colors.cream, textDecoration: 'none', opacity: 0.8 }}>{l}</a>))}</div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', color: colors.lightBlue }}>Contact</h4>
            <div style={{ fontSize: '1rem', lineHeight: '1.8', opacity: 0.8 }}>
              <div><a href="tel:+919310994032" style={{ color: colors.cream, textDecoration: 'none' }}>+91 93109 94032</a></div>
              <div><a href="mailto:parveen@shineoneestate.co.in" style={{ color: colors.cream, textDecoration: 'none' }}>parveen@shineoneestate.co.in</a></div>
              <div style={{ marginTop: 6 }}>{projectData.location}</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${colors.darkBlue}`, paddingTop: '20px', textAlign: 'center', fontSize: '0.9rem', opacity: 0.7 }}>
          © 2025 ShineOne  | All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: colors.cream,
        minHeight: '100vh',
      }}
    >
      <Hero />
      <QuickSnapshot />
      <ProgressTimeline />
      <StoriesViewer />
      <VideoSection />
      <ImageGallery />
      <CollageDesigner />
      <BeforeAfterSlider />
      <MapSection />
      <TeamSection />
      <StickyCTA />
      <Footer />
    </div>
  );
}
