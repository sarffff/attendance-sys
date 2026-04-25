import { superRoleList } from "../../constants/roleCode";
import { useAppSelector } from "@/hooks/useAppSelector";
import SuperAdmin from "./components/superAdmin";
import OtherRole from "./components/otherRole";
const Dashboard = () => {
    const userInfo  = useAppSelector((state) => state.user.userInfo);
    const isSuperRole = superRoleList.includes(userInfo?.roleCode);


    return isSuperRole ? <SuperAdmin /> : <OtherRole />;
};

export default Dashboard;
