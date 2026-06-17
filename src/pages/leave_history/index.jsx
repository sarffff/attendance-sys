import AdminHistory from './components/admin';
import ApproverHistory from './components/approver';
import { useAppSelector } from '@/store/hooks';
const LeaveHistory = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  return (
    <div>
      {user.roleCode === 'ATTENDANCE_ADMIN' ? <AdminHistory /> : <ApproverHistory />}
    </div>
  )
};

export default LeaveHistory;
