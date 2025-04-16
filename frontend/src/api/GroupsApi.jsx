// frontend/src/api/GroupsApi.js
import { API_BASE_URL } from './BASEURL';

export const fetchGroups = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/groups`;
    console.log('Fetching from:', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Response:', response.status, response.headers.get('content-type'));
    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    return await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
};

export const addGroup = async (groupData) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/groups/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create group: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    return await response.json();
  } catch (err) {
    console.error('Add group error:', err);
    throw err;
  }
};

export const updateGroup = async (groupId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/groups/${groupId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update group: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    return await response.json();
  } catch (err) {
    console.error('Update group error:', err);
    throw err;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/groups/${groupId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete group: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 100));
      throw new Error('Received non-JSON response');
    }
    return await response.json();
  } catch (err) {
    console.error('Delete group error:', err);
    throw err;
  }
};

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