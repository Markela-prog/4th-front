"use client";
import withAuth from "../withAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import UserTable from "./components/UserTable";
import { apiRequest } from "./utils/apiUtils";

function HomePage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusMessage, setStatusMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await apiRequest(
        "https://task4-10lg.onrender.com/api/users",
        { method: "GET" },
        router,
        handleLogout
      );
      if (data) setUsers(data);
    };

    fetchUsers();
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/auth");
  }, [router]);

  const handleSelectUser = useCallback((ids) => {
    setSelectedUsers((prev) =>
      Array.isArray(ids)
        ? ids
        : prev.includes(ids)
        ? prev.filter((userId) => userId !== ids)
        : [...prev, ids]
    );
  }, []);

  const showStatusMessage = useCallback((message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const handleSort = useCallback(
    (key) => {
      setSortConfig((prev) => {
        const direction =
          prev.key === key && prev.direction === "asc" ? "desc" : "asc";
        const sortedUsers = [...users].sort((a, b) => {
          if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
          if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
          return 0;
        });
        setUsers(sortedUsers);
        return { key, direction };
      });
    },
    [users]
  );

  const updateUserStatus = useCallback(
    async (isActive) => {
      const data = await apiRequest(
        "https://task4-10lg.onrender.com/api/users/status",
        {
          method: "PUT",
          body: JSON.stringify({ userIds: selectedUsers, isActive }),
        },
        router,
        handleLogout
      );

      if (data) {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: isActive ? "active" : "blocked" }
              : user
          )
        );
        setSelectedUsers([]);
        showStatusMessage(
          `Selected users were successfully ${
            isActive ? "unblocked" : "blocked"
          }!`
        );
      }
    },
    [selectedUsers, router, handleLogout, showStatusMessage]
  );

  const handleDeleteUsers = useCallback(async () => {
    const data = await apiRequest(
      "https://task4-10lg.onrender.com/api/users",
      {
        method: "DELETE",
        body: JSON.stringify({ userIds: selectedUsers }),
      },
      router,
      handleLogout
    );

    if (data) {
      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user.id))
      );
      setSelectedUsers([]);
      showStatusMessage("Selected users were successfully deleted!");
    }

    setIsDeleting(false);
  }, [selectedUsers, router, handleLogout, showStatusMessage]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-5xl relative">
        {/* Logout Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md">
            {statusMessage}
          </div>
        )}

        {/* Confirmation Dialog */}
        {isDeleting && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">
                Are you sure you want to delete the following users?
              </p>
              <ul className="mb-4 list-disc pl-5">
                {selectedUsers.map((id) => {
                  const user = users.find((user) => user.id === id);
                  return <li key={id}>{user?.name || "Unknown User"}</li>;
                })}
              </ul>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUsers}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Table */}
        <UserTable
          users={users}
          onSelectUser={handleSelectUser}
          selectedUsers={selectedUsers}
          sortConfig={sortConfig}
          onSort={handleSort}
          onBlockUsers={() => updateUserStatus(false)}
          onUnblockUsers={() => updateUserStatus(true)}
          onDeleteUsers={() => setIsDeleting(true)}
        />
      </div>
    </div>
  );
}

export default withAuth(HomePage);
