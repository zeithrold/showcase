"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Languages, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePreferences } from "@/components/preferences-provider";
import type { Locale } from "@/lib/i18n";
import { PAGES } from "@/lib/pages";

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label={label} onClick={onClick} className="icon-button">{children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

export function SiteShell({ children, directory = false }: { children: ReactNode; directory?: boolean }) {
  const { t } = useTranslation();
  const { preferences, update } = usePreferences();
  return <>
    <a className="skip-link" href="#main-content">{t("a11y.skip")}</a>
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label={t("a11y.home")}><Mark /><span><span className="brand-owner">zeithrold</span><span className="brand-slash">/</span>showcase</span></Link>
        <nav className="header-nav" aria-label={t("a11y.navigation")}>
          <Link className="nav-link" href="/#pages" aria-current={directory ? "page" : undefined}>{t("header.collection")} <span className="nav-count">{String(PAGES.length).padStart(2, "0")}</span></Link>
          <Dialog>
            <DialogTrigger asChild><Button variant="ghost" className="about-trigger">{t("header.about")} <ArrowUpRight size={13} /></Button></DialogTrigger>
            <DialogContent className="about-dialog">
              <DialogHeader><span className="eyebrow">{t("intro.eyebrow")}</span><DialogTitle>{t("about.title")}</DialogTitle><DialogDescription>{t("about.description")}</DialogDescription></DialogHeader>
              <p className="about-credit">{t("about.credit")} <strong>Zeithrold</strong></p>
              <a className="about-link" href="https://ztd.me" target="_blank" rel="noreferrer">{t("about.visit")} <ArrowUpRight size={15} /></a>
            </DialogContent>
          </Dialog>
          <span className="nav-divider" />
          <Select value={preferences.locale} onValueChange={(locale) => update({ locale: locale as Locale })}>
            <SelectTrigger className="language-select" aria-label={t("header.language")}><Languages size={14} /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="zh-CN">简体中文</SelectItem></SelectContent>
          </Select>
          <IconButton label={t(preferences.theme === "light" ? "header.dark" : "header.light")} onClick={() => update({ theme: preferences.theme === "light" ? "dark" : "light" })}>{preferences.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</IconButton>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><span>{t("footer.credit")} <a href="https://ztd.me" target="_blank" rel="noreferrer">Zeithrold <ArrowUpRight size={12} /></a></span><span className="footer-right"><span className="footer-dot" /> {t("footer.progress")}</span></footer>
    </div>
  </>;
}
