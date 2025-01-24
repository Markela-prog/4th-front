import { useState } from "react";
import {
  FaLock,
  FaUnlock,
  FaTrash,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { formatDistanceToNow, parseISO } from "date-fns";
import { filterUsers } from "../utils/tableUtils";

const ActionButton = ({ onClick, icon, label, bgColor, hoverColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 ${bgColor} text-white py-2 px-4 rounded-md hover:${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
  >
    {icon} {label}
  </button>
);

const SortableHeader = ({ label, sortKey, sortConfig, onSort }) => (
  <th
    className="px-4 py-2 border border-gray-300 text-left cursor-pointer"
    onClick={() => onSort(sortKey)}
  >
    {label}{" "}
    {sortConfig.key === sortKey &&
      (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
  </th>
);

export default function UserTable({
  users,
  onSelectUser,
  selectedUsers,
  sortConfig,
  onSort,
  onBlockUsers,
  onUnblockUsers,
  onDeleteUsers,
}) {
  const [filter, setFilter] = useState("");

  const handleSelectAll = (isChecked) => {
    const allUserIds = isChecked ? users.map((user) => user.id) : [];
    onSelectUser(allUserIds);
  };

  const handleSelectSingle = (userId) => {
    const updatedSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter((id) => id !== userId)
      : [...selectedUsers, userId];
    onSelectUser(updatedSelectedUsers);
  };

  const filteredUsers = filterUsers(users, filter);

  return (
    <div>
      {/* Action Buttons and Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <ActionButton
            onClick={onBlockUsers}
            icon={<FaLock />}
            label="Block"
            bgColor="bg-blue-500"
            hoverColor="bg-blue-600"
          />
          <ActionButton
            onClick={onUnblockUsers}
            icon={<FaUnlock />}
            label="Unblock"
            bgColor="bg-indigo-500"
            hoverColor="bg-indigo-600"
          />
          <ActionButton
            onClick={onDeleteUsers}
            icon={<FaTrash />}
            label="Delete"
            bgColor="bg-red-500"
            hoverColor="bg-red-600"
          />
        </div>
        <input
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* User Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border border-gray-300 text-left">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={
                  selectedUsers.length === users.length && users.length > 0
                }
              />
            </th>
            <SortableHeader
              label="Name"
              sortKey="name"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader
              label="Email"
              sortKey="email"
              sortConfig={sortConfig}
              onSort={onSort}
            />
            <SortableHeader
              label="Last Seen"
              sortKey="last_login"
              sortConfig={sortConfig}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className={`hover:bg-gray-100 ${
                user.status === "blocked" ? "bg-gray-200 text-gray-500" : ""
              }`}
            >
              <td className="px-4 py-2 border border-gray-300">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectSingle(user.id)}
                />
              </td>
              <td
                className={`px-4 py-2 border border-gray-300 ${
                  user.status === "blocked" ? "line-through" : ""
                }`}
              >
                {user.name}
              </td>
              <td className="px-4 py-2 border border-gray-300">{user.email}</td>
              <td className="px-4 py-2 border border-gray-300">
                {user.last_login
                  ? formatDistanceToNow(parseISO(user.last_login), {
                      addSuffix: true,
                    })
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
