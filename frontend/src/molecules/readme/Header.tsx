import { IoArrowBack } from "react-icons/io5";
import { Button } from "../../components/readme/Button";

// Header 컴포넌트의 props 타입 정의
export interface HeaderProps {
  onCreateNewFile: () => void;
  onSaveFile: () => void;
  onClickBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCreateNewFile,
  onSaveFile,
  onClickBack,
}) => {
  return (
    <header className={"bg-gray-50"}>
      <div className="mx-auto px-0 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={onClickBack}
            className={`pr-5 ${"hover:bg-gray-100"}`}
            variant="iconRound"
            title="뒤로가기"
          >
            <IoArrowBack className="w-5 h-5" />
          </Button>
          <h3 className={`font-semibold ${"text-gray-900"}`}>
            README.md 파일 미리보기
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={onCreateNewFile} variant="primary" title="새 파일">
            <span>새로 만들기</span>
          </Button>
          <Button onClick={onSaveFile} variant="success" title="저장">
            <span>저장</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
