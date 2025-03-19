import { Menu, X, Users, Home, Settings } from "lucide-react";
const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="flex items-center bg-gray-900 justify-between p-4 shadow-md fixed w-full lg:relative lg:w-auto">
      <button onClick={toggleSidebar} className="lg:hidden">
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-xl  font-bold">HRMS Dashboard</h1>
    </div>
  );
};

export default Navbar