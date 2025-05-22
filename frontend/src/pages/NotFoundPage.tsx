import ghostImg from '../assets/404ghost.png';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        color: '#555',
      }}
    >
      <div className="flex items-center gap-6 mb-10">
        <span className="text-9xl font-bold">4</span>
        <img src={ghostImg} alt="ghost" className="w-44 h-44 object-contain" />
        <span className="text-9xl font-bold">4</span>
      </div>
      <h1 className=" font-semibold mb-4">
        앗! 페이지를 찾을 수 없어요 <br />
      </h1>
      <p className="text-gray-500 text-lg mb-16">
        이 페이지는 존재하지 않아요! <br />
      </p>
      <a
        href="/project"
        style={{
          background: '#222',
          color: '#fff',
          padding: '14px 36px',
          borderRadius: '30px',
          fontSize: '18px',
          fontWeight: 500,
          textDecoration: 'none',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        홈으로 가기
      </a>
    </div>
  );
};

export default NotFoundPage;
