import { useState, useEffect, useRef } from "react";

const SECTORS = ["sec 4", "sec 9", "sec 42", "sec 46", "reliance met city"];

const BASE_URL = "https://shineoneestate-new-server.onrender.com"

// Maps a Cloudinary resource object → internal media item shape
const mapResource = (r) => ({
  id: r.public_id,
  type: r.resource_type === "video" ? "video" : "image",
  source: r.source === "cloud" ? "cloudinary" : r.source || "cloudinary",
  url: r.secure_url || r.url, // FIX: support both backend formats
  name: r.public_id
    ? r.public_id.split("/").pop() + (r.format ? "." + r.format : "")
    : "file",
  public_id: r.public_id,
});

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f0f2f5",
    minHeight: "100vh",
    color: "#1a1d23",
  },
  sidebar: {
    width: 220,
    background: "#0f1117",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarLogo: {
    padding: "28px 24px 20px",
    borderBottom: "1px solid #1e2130",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: 11,
    color: "#4a5070",
    marginTop: 2,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#3a4060",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    padding: "20px 24px 8px",
  },
  sidebarItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? "#fff" : "#6b7280",
    background: active ? "#1e2233" : "transparent",
    borderLeft: active ? "3px solid #6366f1" : "3px solid transparent",
    transition: "all 0.15s",
  }),
  main: {
    marginLeft: 220,
    padding: "0",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topbarTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1d23",
    flex: 1,
  },
  select: {
    background: "#f8f9fc",
    border: "1px solid #e0e3eb",
    borderRadius: 8,
    padding: "8px 36px 8px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1d23",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    minWidth: 150,
    outline: "none",
  },
  filterBtn: (active) => ({
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid",
    borderColor: active ? "#6366f1" : "#e0e3eb",
    background: active ? "#6366f1" : "#f8f9fc",
    color: active ? "#fff" : "#6b7280",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e0e3eb",
    background: "#f8f9fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#6b7280",
    fontSize: 16,
    transition: "all 0.15s",
  },
  content: {
    padding: 28,
    flex: 1,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: (color) => ({
    background: "#fff",
    borderRadius: 12,
    padding: "18px 20px",
    borderTop: `3px solid ${color}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  }),
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1a1d23",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    fontWeight: 500,
  },
  gallerySection: {
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    marginBottom: 24,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1d23",
  },
  sectionCount: {
    fontSize: 12,
    color: "#9ca3af",
    background: "#f0f2f5",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 14,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    background: "#f8f9fc",
    border: "1px solid #e5e7eb",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  cardImg: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    display: "block",
  },
  cardVideoPlaceholder: {
    width: "100%",
    height: 140,
    background: "linear-gradient(135deg, #1a1d23 0%, #2d3148 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 6,
  },
  playIcon: {
    width: 36,
    height: 36,
    background: "rgba(255,255,255,0.15)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#fff",
  },
  cardInfo: {
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  cardName: {
    fontSize: 11,
    color: "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  badge: (source) => ({
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    background: source === "local" ? "#dcfce7" : "#ede9fe",
    color: source === "local" ? "#166534" : "#5b21b6",
    flexShrink: 0,
  }),
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    background: "rgba(239,68,68,0.9)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 11,
    border: "none",
    opacity: 0,
    transition: "opacity 0.15s",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#9ca3af",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  uploadSection: {
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1d23",
    marginBottom: 16,
  },
  uploadArea: (dragging) => ({
    border: `2px dashed ${dragging ? "#6366f1" : "#e0e3eb"}`,
    borderRadius: 10,
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: dragging ? "#f5f3ff" : "#fafbfc",
    transition: "all 0.2s",
    marginBottom: 16,
  }),
  uploadAreaIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: "#6366f1",
  },
  uploadAreaText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  uploadAreaSub: {
    fontSize: 11,
    color: "#9ca3af",
  },
  previewRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  previewItem: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #e0e3eb",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removePreview: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    background: "rgba(0,0,0,0.6)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 9,
    border: "none",
  },
  uploadRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  sectorTag: {
    padding: "8px 16px",
    background: "#f0f2f5",
    borderRadius: 8,
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  uploadBtn: (loading) => ({
    padding: "9px 24px",
    background: loading ? "#a5b4fc" : "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "background 0.15s",
  }),
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    width: 340,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1a1d23",
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 24,
  },
  modalBtns: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  modalCancel: {
    padding: "9px 24px",
    background: "#f0f2f5",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#6b7280",
  },
  modalDelete: {
    padding: "9px 24px",
    background: "#ef4444",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
  skeleton: {
    background: "linear-gradient(90deg, #f0f2f5 25%, #e5e7eb 50%, #f0f2f5 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.2s infinite",
    borderRadius: 10,
    height: 180,
  },
  tag: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
};

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 14,
      height: 14,
      border: "2px solid rgba(255,255,255,0.4)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function SkeletonGrid() {
  return (
    <div style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [sector, setSector] = useState("sec 42");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [media, setMedia] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const fileInputRef = useRef();

  const [error, setError] = useState(null);

  const loadMedia = async (s) => {
    setLoading(true);
    setError(null);
    try {
      // Encode sector name so spaces become %20 (e.g. "sec 4" → "sec%204")
      const encoded = encodeURIComponent(s);
      console.log("[FRONTEND] loadMedia -> sector:", s);
      console.log("[FRONTEND] loadMedia -> encoded:", encoded);
      console.log("[FRONTEND] loadMedia -> URL:", `${BASE_URL}/media/${encoded}`);
      const res = await fetch(`${BASE_URL}/media/${encoded}`);
      console.log("[FRONTEND] loadMedia -> response status:", res.status);
      console.log("[FRONTEND] loadMedia -> response ok:", res.ok);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load media");
      const items = (data.resources || []).map(mapResource);
      setMedia(prev => ({ ...prev, [s]: items }));
    } catch (err) {
      console.error("[FRONTEND] loadMedia ERROR:", err);
      setError(err.message);
      setMedia(prev => ({ ...prev, [s]: [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(sector);
  }, [sector]);

  const currentMedia = (media[sector] || []).filter(m =>
    sourceFilter === "all" ? true : m.source === sourceFilter
  );

  const allMedia = media[sector] || [];
  const localCount = allMedia.filter(m => m.source === "local").length;
  const cloudCount = allMedia.filter(m => m.source === "cloudinary").length;
  const videoCount = allMedia.filter(m => m.type === "video").length;

  const handleSectorChange = (e) => {
    setSector(e.target.value);
    setSourceFilter("all");
  };

  const handleRefresh = () => {
    setMedia(prev => ({ ...prev, [sector]: undefined }));
    loadMedia(sector);
  };

  const handleFileChange = (files) => {
    const fileArr = Array.from(files);
    const newPreviews = fileArr.map(f => ({
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      type: f.type.startsWith("video/") ? "video" : "image",
      name: f.name,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleUpload = async () => {
    if (!previews.length) return;

    setUploading(true);

    try {
      const formData = new FormData();

      previews.forEach((p) => {
        formData.append("files", p.file);
      });

      formData.append("folder", sector);

      console.log("[FRONTEND] handleUpload -> files count:", previews.length);
      console.log("[FRONTEND] handleUpload -> folder:", sector);
      console.log("[FRONTEND] handleUpload -> URL:", `${BASE_URL}/upload-multiple`);

      const res = await fetch(`${BASE_URL}/upload-multiple`, {
        method: "POST",
        body: formData,
      });
      console.log("[FRONTEND] handleUpload -> response status:", res.status);
      console.log("[FRONTEND] handleUpload -> response ok:", res.ok);

      // Guard for failed response
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[FRONTEND] Upload failed response:", errorText);
        throw new Error(`Upload failed: ${res.status}`);
      }

      // Safer JSON parsing
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("[FRONTEND] Upload response is not JSON:", text);
        throw new Error("Server returned invalid response (not JSON)");
      }

      if (!data.success) throw new Error("Upload failed");

      const newItems = data.files.map((item) => ({
        id: item.public_id,
        type: item.resource_type === "video" ? "video" : "image",
        source: "cloudinary",
        url: item.url,
        name: item.public_id.split("/").pop(),
        public_id: item.public_id,
      }));

      setMedia((prev) => ({
        ...prev,
        [sector]: [...(prev[sector] || []), ...newItems],
      }));

      setPreviews([]);
    } catch (err) {
      console.error("[FRONTEND] UPLOAD ERROR:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setMedia(prev => ({
      ...prev,
      [sector]: (prev[sector] || []).filter(m => m.id !== deleteTarget.id),
    }));
    setDeleteTarget(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .media-card:hover .delete-btn { opacity: 1 !important; }
        .media-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .sidebar-item:hover { background: #1a1d2e; color: #d1d5db !important; }
        select:focus { outline: 2px solid #6366f1; }
      `}</style>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoText}>ShineOne</div>
          <div style={styles.logoSub}>Media Admin</div>
        </div>
        <div style={styles.sidebarLabel}>Sections</div>
        {[
          { label: "Media Gallery", icon: "🖼" },
          { label: "Analytics", icon: "📊" },
          { label: "Settings", icon: "⚙️" },
        ].map(item => (
          <div
            key={item.label}
            className="sidebar-item"
            style={styles.sidebarItem(item.label === "Media Gallery")}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2130" }}>
          <div style={{ fontSize: 11, color: "#3a4060", marginBottom: 4 }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>Admin</div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Media Gallery</div>

          {/* Sector Dropdown */}
          <select style={styles.select} value={sector} onChange={handleSectorChange}>
            {SECTORS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {/* Source Filter */}
          {["all", "local", "cloudinary"].map(f => (
            <button
              key={f}
              style={styles.filterBtn(sourceFilter === f)}
              onClick={() => setSourceFilter(f)}
            >
              {f === "all" ? "All" : f === "local" ? "🟢 Local" : "☁️ Cloud"}
            </button>
          ))}

          {/* Refresh */}
          <div style={styles.refreshBtn} onClick={handleRefresh} title="Refresh">
            🔄
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>

          {/* Stats */}
          <div style={styles.statsRow}>
            {[
              { label: "Total Files", value: allMedia.length, color: "#6366f1" },
              { label: "Local Files", value: localCount, color: "#22c55e" },
              { label: "Cloud Files", value: cloudCount, color: "#8b5cf6" },
              { label: "Videos", value: videoCount, color: "#f59e0b" },
            ].map(stat => (
              <div key={stat.label} style={styles.statCard(stat.color)}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Gallery */}
          <div style={styles.gallerySection}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                {sector.charAt(0).toUpperCase() + sector.slice(1)} — Media
              </div>
              <div style={styles.sectionCount}>{currentMedia.length} files</div>
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : currentMedia.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <div style={styles.emptyText}>No media found in this sector</div>
                <div style={styles.emptySubText}>Upload files below to get started</div>
              </div>
            ) : (
              <div style={styles.grid}>
                {currentMedia.map(item => (
                  <div
                    key={item.id}
                    className="media-card"
                    style={{
                      ...styles.card,
                      animation: "fadeIn 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Source tag */}
                    <div style={{
                      ...styles.tag,
                      background: item.source === "local" ? "#dcfce7" : "#ede9fe",
                      color: item.source === "local" ? "#166534" : "#5b21b6",
                    }}>
                      {item.source === "local" ? "LOCAL" : "CLOUD"}
                    </div>

                    {/* Thumbnail */}
                    {item.type === "video" ? (
                      <div style={styles.cardVideoPlaceholder}>
                        <div style={styles.playIcon}>▶</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>VIDEO</div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        style={styles.cardImg}
                        loading="lazy"
                      />
                    )}

                    {/* Info */}
                    <div style={styles.cardInfo}>
                      <div style={styles.cardName} title={item.name}>{item.name}</div>
                      <div style={styles.badge(item.source)}>
                        {item.type === "video" ? "VID" : "IMG"}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      className="delete-btn"
                      style={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload */}
          <div style={styles.uploadSection}>
            <div style={styles.uploadTitle}>Upload Media</div>

            {/* Drop Zone */}
            <div
              style={styles.uploadArea(dragging)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.uploadAreaIcon}>☁️</div>
              <div style={styles.uploadAreaText}>
                {dragging ? "Drop files here!" : "Click or drag files here"}
              </div>
              <div style={styles.uploadAreaSub}>Supports: JPG, PNG, GIF, MP4, MOV, WebM</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div style={styles.previewRow}>
                {previews.map((p, i) => (
                  <div key={i} style={styles.previewItem}>
                    {p.url ? (
                      <img src={p.url} alt={p.name} style={styles.previewImg} />
                    ) : (
                      <div style={{
                        ...styles.previewImg,
                        background: "#1a1d23",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 18,
                      }}>▶</div>
                    )}
                    <button
                      style={styles.removePreview}
                      onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Row */}
            <div style={styles.uploadRow}>
              <div style={styles.sectorTag}>
                <span>📂</span>
                <span>ShineOne / {sector}</span>
              </div>
              <button
                style={styles.uploadBtn(uploading || !previews.length)}
                onClick={handleUpload}
                disabled={uploading || !previews.length}
              >
                {uploading ? <><Spinner /> Uploading…</> : `⬆ Upload ${previews.length > 0 ? `(${previews.length})` : ""}`}
              </button>
              {previews.length > 0 && (
                <button
                  style={{ ...styles.modalCancel, fontSize: 13 }}
                  onClick={() => setPreviews([])}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div style={styles.modal} onClick={() => setDeleteTarget(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={styles.modalIcon}>🗑️</div>
            <div style={styles.modalTitle}>Delete File?</div>
            <div style={styles.modalSub}>
              Are you sure you want to delete<br />
              <strong>{deleteTarget.name}</strong>?<br />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                Source: {deleteTarget.source === "local" ? "🟢 Local" : "☁️ Cloudinary"}
              </span>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.modalCancel} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button style={styles.modalDelete} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}