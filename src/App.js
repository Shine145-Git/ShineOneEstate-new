import './App.css';
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import usePageMeta from './hooks/usePageMeta';
import { routeFor } from './lib/routes';

// Every page is its own bundle: the 3D home experience (three.js, audio) only loads on "/".
const HomeExperience = lazy(() => import('./HomeExperience.jsx'));
const AdminPanel = lazy(() => import('./AdminPanel.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const LocationsPage = lazy(() => import('./pages/LocationsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Old links used HashRouter (/#/admin). Move them to the matching real path once, keeping history clean. */
export function HashRedirect() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash.startsWith('#/')) navigate(hash.slice(1), { replace: true });
  }, [hash, navigate]);
  return null;
}

function Home() {
  usePageMeta({ ...routeFor('/'), path: '/' });
  return <HomeExperience />;
}

function Admin() {
  usePageMeta({ title: 'Admin | ShineOne Estate', description: 'ShineOne Estate admin', path: '/admin', noindex: true });
  return <AdminPanel />;
}

// Matches each page's background so there is no flash between the prerendered HTML and React.
const Loading = () => {
  const { pathname } = useLocation();
  const dark = pathname === '/' || pathname.startsWith('/admin');
  return <div style={{ minHeight: '100vh', background: dark ? '#0C0F1A' : '#F7F5F0' }} aria-busy="true" />;
};

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <HashRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
