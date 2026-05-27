
import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
  return (
    <div className="sidebar">
      <h2>{role.toUpperCase()}</h2>

      <Link to={`/${role}/dashboard`}>Dashboard</Link>
      <Link to="#">Profile</Link>
      <Link to="#">Settings</Link>
    </div>
  );
};

export default Sidebar;
