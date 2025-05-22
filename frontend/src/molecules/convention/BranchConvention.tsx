import { useState } from 'react';
import BranchViewer from '../../components/convention/branch/BranchViewer';
import BranchForm from '../../components/convention/branch/BranchForm';
import BranchActions from '../../components/convention/branch/BranchActions';
import { useParams } from 'react-router-dom';

const BranchConvention = () => {
  const { projectId } = useParams();
  const [updated, setUpdated] = useState(false);

  const refresh = () => setUpdated(prev => !prev);

  return (
    <div className="space-y-3">
      <div className="pt-5 pr-5 flex justify-end">
        <BranchActions projectId={Number(projectId)} onUpdate={refresh} />
      </div>
      <div className="p-5">
        <BranchViewer projectId={Number(projectId)} key={updated.toString()} />
      </div>
      <hr className="p-3" />
      <div className="px-5 pb-5">
        <BranchForm projectId={Number(projectId)} onUpdate={refresh} />
      </div>
    </div>
  );
};

export default BranchConvention;
