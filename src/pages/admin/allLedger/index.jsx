import HrAllLedger from "./components/hr-all-ledger";
import LeadersAllLedger from "./components/leaders-all-ledger";
import { useAppSelector } from '@/store/hooks';

const AllLedger = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  return (
    <div>
      { user?.roleCode === 'ATTENDANCE_ADMIN' ? <HrAllLedger /> : <LeadersAllLedger /> }
    </div>
  )
}

export default AllLedger;
