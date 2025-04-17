// frontend/src/api/GroupsApi.js
import { API_BASE_URL } from './BASEURL';
import axios from 'axios';
// export const fetchGroups = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const url = `${API_BASE_URL}/groups`;
//     const response = await fetch(url, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to fetch groups: ${response.status}`);
//     }
//     return await response.json();
//   } catch (err) {
//     console.error("Fetch groups error:", err);
//     throw err;
//   }
// };

// export const addGroup = async (groupData) => {
//   try {
//     const token = localStorage.getItem("token");
//     console.log(token)
//     const url = `${API_BASE_URL}/groups/create`;
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(groupData),
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to create group: ${response.status}`);
//     }
//     return await response.json();
//   } catch (err) {
//     console.error("Add group error:", err);
//     throw err;
//   }
// };

// export const updateGroup = async (groupId, updateData) => {
//   try {
//     const token = localStorage.getItem('token');
//     const url = `${API_BASE_URL}/groups/${groupId}`;
//     const response = await fetch(url, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(updateData),
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to update group: ${response.status}`);
//     }
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const text = await response.text();
//       console.error('Non-JSON response:', text.slice(0, 100));
//       throw new Error('Received non-JSON response');
//     }
//     return await response.json();
//   } catch (err) {
//     console.error('Update group error:', err);
//     throw err;
//   }
// };


// src/api/GroupsApi.jsx


export const addGroup = async (groupData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    console.log("Sending group data:", groupData);
    console.log("Authorization token:", token);
    const response = await axios.post(
      "http://localhost:8000/api/v1/groups/create",
      groupData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Add group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to create group");
  }
};

export const updateGroup = async (groupId, groupData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const response = await axios.put(
      `http://localhost:8000/api/v1/groups/${groupId}`,
      groupData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to update group");
  }
};

export const fetchGroups = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const response = await axios.get("http://localhost:8000/api/v1/groups", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch groups error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch groups");
  }
};

export const handleAddLeadtoGroup = async (e, groupId, userId, setShowAddLeadModal, setSelectedUserId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const response = await axios.post(
      `http://localhost:8000/api/v1/groups/${groupId}/leads`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setShowAddLeadModal(false);
    setSelectedUserId("");
    return response.data;
  } catch (error) {
    console.error("Add lead to group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to add lead to group");
  }
};

export const fetchLeadsByGroup = async (groupId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const response = await axios.get(`http://localhost:8000/api/v1/groups/${groupId}/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch leads error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch leads");
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const response = await axios.delete(`http://localhost:8000/api/v1/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete group error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to delete group");
  }
};

// Other API functions (fetchGroups, handleAddLeadtoGroup, fetchLeadsByGroup, deleteGroup) ...

// export const deleteGroup = async (groupId) => {
//   try {
//     const token = localStorage.getItem('token');
//     const url = `${API_BASE_URL}/groups/${groupId}`;
//     const response = await fetch(url, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to delete group: ${response.status}`);
//     }
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const text = await response.text();
//       console.error('Non-JSON response:', text.slice(0, 100));
//       throw new Error('Received non-JSON response');
//     }
//     return await response.json();
//   } catch (err) {
//     console.error('Delete group error:', err);
//     throw err;
//   }
// };

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/user/list/all`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    const data = await response.json();
    console.log('Users data:', data);
    return data;
  } catch (err) {
    console.error('Fetch users error:', err);
    throw err;
  }
};
// Add this to your GroupsApi.js file

// export const fetchLeadsByGroup = async (groupId) => {
//   try {
//     const token = localStorage.getItem('token');
//     const url = `${API_BASE_URL}/groups/${groupId}/leads`;
//     console.log('Fetching leads from group:', url);
//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     console.log('Response:', response.status, response.headers.get('content-type'));
//     if (!response.ok) {
//       throw new Error(`Failed to fetch leads for group: ${response.status}`);
//     }
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const text = await response.text();
//       console.error('Non-JSON response:', text.slice(0, 100));
//       throw new Error('Received non-JSON response');
//     }
//     return await response.json();
//   } catch (err) {
//     console.error('Fetch leads error:', err);
//     throw err;
//   }
// };

// // Add this helper function to handle adding leads to a group
// export const handleAddLeadtoGroup = async (
//   e, 
//   groupId, 
//   userId, 
//   setShowAddLeadModal, 
//   setSelectedUserId
// ) => {
//   e.preventDefault();
//   try {
//     await addLeadToGroup(groupId, userId);
//     setShowAddLeadModal(false);
//     setSelectedUserId("");
//     // You might want to refresh the group data here
//     // await fetchData();
//   } catch (error) {
//     console.error("Error adding lead to group:", error);
//   }
// };
export const addLeadToGroup = async (groupId, userId) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/groups/${groupId}/${userId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to add lead to group: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    return await response.json();
  } catch (err) {
    console.error('Add lead to group error:', err);
    throw err;
  }
};