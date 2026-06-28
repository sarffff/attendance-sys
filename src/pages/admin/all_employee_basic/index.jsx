import HrAllEmployeeBasic from "./components/hr";
import LeaderAllEmployeeBasic from "./components/leader";
import { useAppSelector } from "@/store/hooks";

const AllLedger = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  return (
    <div>
      {user?.roleCode === "ATTENDANCE_ADMIN" ? (
        <HrAllEmployeeBasic />
      ) : (
        <LeaderAllEmployeeBasic />
      )}
    </div>
  );
};

export default AllLedger;
