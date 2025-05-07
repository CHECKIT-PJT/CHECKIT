import { useState } from 'react';
import { IoAdd, IoClose, IoMail, IoLink, IoCopy } from 'react-icons/io5';
import { TbMailUp } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { useCreateInvitationLink } from '../../api/projectAPI';

interface MemberAddButtonProps {
  projectId: number;
  projectName: string;
}

const MemberAddButton = ({ projectId, projectName }: MemberAddButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');
  const [inviteUrl, setInviteUrl] = useState('');

  const createInvitationLink = useCreateInvitationLink();

  const openModal = async () => {
    setIsModalOpen(true);
    try {
      const response = await createInvitationLink.mutateAsync(projectId);
      if (response.result) {
        setInviteUrl(response.result.invitationLink);
      }
    } catch (error) {
      console.error('초대 링크 생성 실패:', error);
      toast.error('초대 링크 생성에 실패했습니다.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInviteEmail('');
    setEmailError('');
    setCopySuccess(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(e.target.value);
    setEmailError('');
  };

  const sendInviteEmail = () => {
    if (!inviteEmail) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    // TODO: 이메일 전송 로직 추가
    toast.success('초대장이 발송되었습니다!');
    setInviteEmail('');
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopySuccess(true);
      toast.success('초대 링크가 복사되었습니다!');
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      toast.error('링크 복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="팀원 추가"
      >
        <IoAdd className="w-5 h-5" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">팀원 초대하기</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex w-full border-b mb-4">
                <button
                  className={`flex-1 py-2 px-4 text-center ${
                    activeTab === 'email'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('email')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <IoMail />
                    <span>이메일 초대</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center ${
                    activeTab === 'link'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('link')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <IoLink />
                    <span>초대 링크</span>
                  </div>
                </button>
              </div>

              {activeTab === 'email' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    팀원에게 초대 이메일을 보내세요.
                  </p>
                  <div className="flex items-center mb-4">
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={handleEmailChange}
                      placeholder="example@email.com"
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm focus:outline-none ${
                        emailError ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      onClick={sendInviteEmail}
                      className="bg-blue-600 p-2 text-white rounded-r-md"
                    >
                      <TbMailUp className="w-5 h-5" />
                    </button>
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    아래 링크를 복사하여 팀원에게 공유하세요.
                  </p>
                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm focus:outline-none"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="bg-blue-600 p-2 text-white rounded-r-md"
                    >
                      <IoCopy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberAddButton;
