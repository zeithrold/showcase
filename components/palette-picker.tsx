"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreferences } from "@/components/preferences-provider";
import { PALETTES } from "@/lib/palettes";

export function PalettePicker() {
  const { t } = useTranslation();
  const { preferences, update } = usePreferences();
  const labelId = useId();
  return <div className="appearance-settings">
    <span id={labelId}>{t("settings.palette")}</span>
    <div className="palette-options" role="group" aria-labelledby={labelId}>{PALETTES.map((palette) => <Tooltip key={palette.id}><TooltipTrigger asChild><Button variant="ghost" className="palette-swatch" aria-label={t(`palette.${palette.id}`)} aria-pressed={preferences.palette === palette.id} onClick={() => update({ palette: palette.id })}>{palette.colors.map((color) => <span key={color} aria-hidden="true" style={{ background: color }} />)}</Button></TooltipTrigger><TooltipContent>{t(`palette.${palette.id}`)}</TooltipContent></Tooltip>)}</div>
    <span className="palette-name">{t(`palette.${preferences.palette}`)}</span>
  </div>;
}
