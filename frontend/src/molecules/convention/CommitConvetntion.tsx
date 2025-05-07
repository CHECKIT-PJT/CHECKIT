import { useState } from 'react';
import CommitViewer from '../../components/convention/commit/CommitViewer';
import CommitForm from '../../components/convention/commit/CommitForm';
import CommitAction from '../../components/convention/commit/CommitAction';

const CommitConvention = () => {
  const projectId = '1';
  const [updated, setUpdated] = useState(false);

  const refresh = () => setUpdated(prev => !prev);

  return (
    <div className="space-y-3">
      <div className="pt-5 pr-5 flex justify-end">
        <CommitAction projectId={projectId} onUpdate={refresh} />
      </div>
      <div className="p-5">
        <CommitViewer projectId={projectId} key={updated.toString()} />
      </div>
      <hr className="p-3" />
      <div className="px-5 pb-5">
        <CommitForm projectId={projectId} onUpdate={refresh} />
      </div>
    </div>
  );
};

export default CommitConvention;
