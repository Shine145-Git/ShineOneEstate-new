import React from "react";
import { Link } from "react-router-dom";
import PageLayout, { PageHero } from "../components/Layout";
import usePageMeta from "../hooks/usePageMeta";

export default function NotFoundPage() {
  usePageMeta({ title: "Page not found | ShineOne Estate", description: "This page does not exist.", path: "/404", noindex: true });
  return (
    <PageLayout>
      <PageHero title={<>Page <em>not found</em></>} lede="The page you were looking for has moved or does not exist.">
        <div className="sx-btn-row">
          <Link className="sx-btn sx-btn--gold" to="/">Go to the home page</Link>
          <Link className="sx-btn sx-btn--light" to="/projects">See our projects</Link>
        </div>
      </PageHero>
    </PageLayout>
  );
}
