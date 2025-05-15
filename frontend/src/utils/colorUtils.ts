const USER_COLORS = [
  '#2563EB', // 파랑
  '#DC2626', // 빨강
  '#059669', // 초록
  '#7C3AED', // 보라
  '#DB2777', // 분홍
  '#EA580C', // 주황
  '#0D9488', // 청록
  '#4F46E5', // 남색
  '#BE185D', // 자주
  '#2563EB', // 파랑 (반복)
];

// 사용자 ID를 기반으로 HSL 색상을 생성하는 함수
export const getUserColor = (userId: string): string => {
  // userId를 숫자로 변환 (해시 함수)
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 색상(Hue): 0-360 범위의 각도
  // hash를 360으로 나눈 나머지를 사용하여 색상 결정
  const hue = hash % 360;

  // 채도(Saturation): 65-90% 범위
  // 채도를 65-90% 사이로 제한하여 너무 흐리지 않게 함
  const saturation = 65 + (hash % 25);

  // 밝기(Lightness): 45-65% 범위
  // 밝기를 45-65% 사이로 제한하여 너무 어둡거나 밝지 않게 함
  const lightness = 45 + (hash % 20);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}; 