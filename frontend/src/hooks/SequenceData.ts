/**
 * 더미 카테고리 데이터
 */
export const dummyCategories = [
  { id: "auth", name: "인증" },
  { id: "user", name: "사용자" },
  { id: "product", name: "상품" },
  { id: "order", name: "주문" },
  { id: "payment", name: "결제" },
  { id: "sequence", name: "시퀀스" },
];

/**
 * 더미 다이어그램 코드 데이터
 */
export const dummyDiagramCodes: { [key: string]: string } = {
  auth: `sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant D as Database
    
    C->>A: POST /api/auth/login
    A->>D: 사용자 정보 조회
    D-->>A: 사용자 데이터 반환
    A->>A: 비밀번호 검증
    A->>A: JWT 토큰 생성
    A-->>C: 200 OK (토큰 반환)`,

  user: `sequenceDiagram
    participant C as Client
    participant U as User API
    participant D as Database
    
    C->>U: GET /api/users/profile
    Note over C,U: Authorization 헤더에 JWT 포함
    U->>U: JWT 검증
    U->>D: 사용자 프로필 조회
    D-->>U: 사용자 데이터
    U-->>C: 200 OK (사용자 프로필)`,

  product: `sequenceDiagram
    participant C as Client
    participant P as Product API
    participant D as Database
    
    C->>P: GET /api/products?category=electronics
    P->>D: 전자제품 카테고리 상품 조회
    D-->>P: 상품 목록 반환
    P-->>C: 200 OK (상품 목록)
    
    C->>P: GET /api/products/123
    P->>D: ID가 123인 상품 조회
    D-->>P: 상품 상세 정보
    P-->>C: 200 OK (상품 상세)`,

  order: `sequenceDiagram
    participant C as Client
    participant O as Order API
    participant P as Product API
    participant D as Database
    
    C->>O: POST /api/orders
    Note over C,O: 주문 상품 정보 및 배송지 포함
    O->>P: 재고 확인
    P-->>O: 재고 상태
    O->>D: 주문 정보 저장
    D-->>O: 주문 ID 반환
    O-->>C: 201 Created (주문 정보)`,

  payment: `sequenceDiagram
    participant C as Client
    participant P as Payment API
    participant G as Payment Gateway
    participant O as Order API
    participant D as Database
    
    C->>P: POST /api/payments
    Note over C,P: 주문 ID, 결제 방법 포함
    P->>O: 주문 정보 조회
    O-->>P: 주문 정보 및 금액
    P->>G: 결제 요청
    G-->>P: 결제 승인/거절
    P->>D: 결제 내역 저장
    D-->>P: 결제 ID 반환
    P-->>C: 200 OK (결제 결과)`,
};

/**
 * 더미 다이어그램 이미지 URL
 * 실제 프로젝트에서는 적절한 이미지 URL로 대체해야 함
 */
export const dummyDiagramUrls: { [key: string]: string } = {
  auth: "https://via.placeholder.com/800x400?text=Authentication+Sequence+Diagram",
  user: "https://via.placeholder.com/800x400?text=User+Sequence+Diagram",
  product: "https://via.placeholder.com/800x400?text=Product+Sequence+Diagram",
  order: "https://via.placeholder.com/800x400?text=Order+Sequence+Diagram",
  payment: "https://via.placeholder.com/800x400?text=Payment+Sequence+Diagram",
};
