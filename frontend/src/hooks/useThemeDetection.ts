import { useState, useEffect } from "react";
/**
 * 시스템 테마 감지 훅
 * @returns {boolean} 다크 모드 여부
 */
const useThemeDetection = (): boolean => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // 시스템 다크 모드 설정 감지
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent): void => {
      setIsDarkMode(e.matches);
    };

    // 브라우저 호환성을 위한 이벤트 리스너 추가 방식
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Safari 13.1 이하 지원
      mediaQuery.addListener(handleChange);
    }

    // 클린업 함수
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Safari 13.1 이하 지원
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return isDarkMode;
};

export default useThemeDetection;
