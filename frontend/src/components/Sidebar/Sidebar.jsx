import { Menu, X, Users, Home, Settings } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform lg:relative lg:translate-x-0 shadow-lg`}
    >
      <button onClick={toggleSidebar} className="lg:hidden p-4 text-white">
        <X className="w-6 h-6" />
      </button>
      <ul className="p-4 space-y-4">
        <li className="flex items-center space-x-2 p-3 rounded hover:bg-zinc-700 cursor-pointer">
          <Home className="w-5 h-5" /> <span>Dashboard</span>
        </li>
        <li className="flex items-center space-x-2 p-3 rounded hover:bg-zinc-700 cursor-pointer">
          <Users className="w-5 h-5" /> <span>Leads</span>
        </li>
        <li className="flex items-center space-x-2 p-3 rounded hover:bg-zinc-700 cursor-pointer">
          <Settings className="w-5 h-5" /> <span>Settings</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar