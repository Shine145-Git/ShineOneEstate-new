import React from "react";
import { Phone } from "lucide-react";
import PageLayout, { PageHero, WhatsAppGlyph } from "../components/Layout";
import usePageMeta from "../hooks/usePageMeta";
import { routeFor } from "../lib/routes";
import { CONTACT, WA_URL } from "../lib/site";

const EFFECTIVE_DATE = "17 November 2026";

export default function PrivacyPolicyPage() {
  const meta = routeFor("/privacy-policy");
  usePageMeta({ ...meta, path: "/privacy-policy" });

  return (
    <PageLayout>
      <PageHero short eyebrow="Legal" title={<>Privacy <em>Policy</em></>}
        lede={`Effective date: ${EFFECTIVE_DATE}`}
        crumbs={[["/", "Home"], [null, "Privacy Policy"]]} />
      <section className="sx-section">
        <div className="sx-wrap" style={{ maxWidth: 820, display: "grid", gap: 28, lineHeight: 1.75 }}>
          <p>Shine One Estate respects your privacy and is committed to protecting your personal information.</p>

          <div>
            <h2>1. Information We Collect</h2>
            <p>We may collect your:</p>
            <ul className="sx-list" style={{ marginTop: 10 }}>
              <li>Full name</li>
              <li>Mobile number</li>
              <li>Property and plot ownership details</li>
              <li>Construction requirements and project preferences</li>
            </ul>
          </div>

          <div>
            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="sx-list" style={{ marginTop: 10 }}>
              <li>Respond to construction enquiries.</li>
              <li>Share construction pricing and project details.</li>
              <li>Arrange site visits and consultations.</li>
              <li>Contact you through phone calls or WhatsApp.</li>
            </ul>
          </div>

          <div>
            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. Information may be processed by authorized service providers where necessary to manage enquiries and provide our services.</p>
          </div>

          <div>
            <h2>4. Data Security</h2>
            <p>We take reasonable measures to protect your personal information against unauthorized access, misuse or disclosure.</p>
          </div>

          <div>
            <h2>5. Your Rights</h2>
            <p>You can request access, correction or deletion of your personal information by contacting us.</p>
          </div>

          <div>
            <h2>6. Contact Us</h2>
            <ul className="sx-list" style={{ marginTop: 10 }}>
              <li>Business: Shine One Estate</li>
              <li>Phone/WhatsApp: <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a></li>
              <li>Website: <a href="https://shineoneestate.co.in">https://shineoneestate.co.in</a></li>
            </ul>
            <p style={{ marginTop: 12 }}>For privacy-related questions or data deletion requests, please contact us using the number above.</p>
            <div className="sx-btn-row" style={{ marginTop: 18 }}>
              <a className="sx-btn sx-btn--gold" href={WA_URL} target="_blank" rel="noreferrer"><WhatsAppGlyph /> WhatsApp us</a>
              <a className="sx-btn sx-btn--light" href={`tel:${CONTACT.phone}`}><Phone size={17} /> Call {CONTACT.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
