import { useEffect } from "react";
import {
  DEFAULT_THEME_COLOR,
  applyThemePalette,
  normalizeThemeColor,
} from "../utils/themeColor";

const useThemeColor = (themeColor) => {
  useEffect(() => {
    applyThemePalette(themeColor);

    return () => {
      applyThemePalette(DEFAULT_THEME_COLOR);
    };
  }, [themeColor]);

  return normalizeThemeColor(themeColor);
};

export default useThemeColor;
