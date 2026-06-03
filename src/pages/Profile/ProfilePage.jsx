import Profile from "../../components/Profile";
import DashboardLayout from "../../layouts/DashboardLayout";

const ProfilePage = ({ role }) => {
  return (
    <DashboardLayout role={role}>
      <Profile role={role} />
    </DashboardLayout>
  );
};

export default ProfilePage;
