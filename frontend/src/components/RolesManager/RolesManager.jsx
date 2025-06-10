import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../../api/BASEURL';

// Create axios instance with auth configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] });
  const [newPermissions, setNewPermissions] = useState("");
  const [users, setUsers] = useState([]);
  const [rolesDropdown, setRolesDropdown] = useState([]);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchRolesDropdown();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleRoleSelect = async (roleName) => {
    try {
      setSelectedRole(roleName);
      const response = await api.get(`/roles/permissions/${roleName}`);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleAddRole = async () => {
    try {
      await api.post('/roles/add', newRole);
      setNewRole({ name: "", permissions: [] });
      fetchRoles();
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleAddPermissions = async () => {
    try {
      await api.put(`/roles/permissions/add/${selectedRole}`, {
        permissions: newPermissions.split(","),
      });
      setNewPermissions("");
      handleRoleSelect(selectedRole);
    } catch (error) {
      console.error("Error adding permissions:", error);
    }
  };

  const handleRemovePermissions = async (permission) => {
    try {
      await api.delete(`/roles/permissions/remove/${selectedRole}/${permission}`);
      handleRoleSelect(selectedRole);
    } catch (error) {
      console.error("Error removing permission:", error);
    }
  };

  // Fetch users with pagination and search
  const fetchUsers = async (page = 1, search = "") => {
    try {
      const response = await api.get('/user/list', {
        params: { page, search }
      });
      setUsers(response.data.users);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch roles for dropdown
  const fetchRolesDropdown = async () => {
    try {
      const response = await api.get('/roles');
      setRolesDropdown(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Assign role to user
  const handleAssignRole = async (userId) => {
    try {
      const roleId = selectedRoleForUser[userId];
      await api.post('/user/role', { userId, roleId });
      alert("Role Assigned!");
      fetchUsers(pagination.page, searchQuery);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Roles and Permissions Manager
      </h1>
      <div className="grid grid-cols-2 gap-6">
        {/* Left Side: User Permissions Management */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            User Permissions
          </h2>
          <input
            type="text"
            placeholder="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(1, searchQuery)}
            className="p-2 border border-gray-300 rounded-md mb-4 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ul className="list-disc pl-5">
            {users.map((user) => (
              <li key={user._id} className="flex items-center gap-4 mb-2">
                <span className="flex-1">{user.fullName}</span>
                <select
                  value={selectedRoleForUser[user._id] ?? user.role?._id ?? ""}
                  onChange={(e) =>
                    setSelectedRoleForUser({
                      ...selectedRoleForUser,
                      [user._id]: e.target.value,
                    })
                  }
                  className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  {rolesDropdown.map((role) =>
                     
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    
                  )}
                </select>
                <button
                  onClick={() => handleAssignRole(user._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Assign
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1, searchQuery)}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1, searchQuery)}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right Side: Role Management */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Role Management
          </h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Add New Role
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Role Name"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Permissions (comma-separated)"
                value={newRole.permissions.join(",")}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    permissions: e.target.value.split(","),
                  })
                }
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddRole}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Role
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Roles</h3>
            <ul className="list-disc pl-5">
              {Array.isArray(roles) &&
                roles.map((role) => (
                  <li
                    key={role.name}
                    onClick={() => handleRoleSelect(role.name)}
                    className="cursor-pointer text-blue-600 hover:underline"
                  >
                    {role.name}
                  </li>
                ))}
            </ul>
          </div>

          {selectedRole && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Permissions for {selectedRole}
              </h3>
              <ul className="list-disc pl-5 mb-4">
                {permissions.map((permission) => (
                  <li key={permission} className="flex items-center gap-2">
                    <span>{permission}</span>
                    <button
                      onClick={() => handleRemovePermissions(permission)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Add Permissions (comma-separated)"
                  value={newPermissions}
                  onChange={(e) => setNewPermissions(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddPermissions}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Permissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RolesManager;
