import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';

function ChapterPage() {
  // TODO : 프로젝트 이름 받아오기
  const projectName = 'S12A501';
  const location = useLocation();
  const currentPath = location.pathname;

  const getRouteText = () => {
    if (currentPath.includes('/build')) {
      return '/build';
    }
    if (currentPath.includes('/develop')) {
      if (currentPath.includes('/develop/erd')) return '/develop /erd';
      if (currentPath.includes('/develop/api')) return '/develop /api';
      if (currentPath.includes('/develop/function'))
        return '/develop  /function';
      return '/develop';
    }

    return '';
  };

  const navigate = useNavigate();
  const onClickBack = () => {
    navigate(-1);
  };
  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onClickBack}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <h2>
          {projectName}
          <span className="text-gray-500 ml-3"> {getRouteText()}</span>
        </h2>
      </div>
      <Outlet />
    </div>
  );
}

export default ChapterPage;
