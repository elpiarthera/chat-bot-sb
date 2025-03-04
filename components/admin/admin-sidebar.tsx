// Placeholder for admin sidebar component
// This is a temporary implementation until the admin panel is fully developed

import React from "react"

export function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="mb-4 text-lg font-semibold">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <a href="/admin" className="block rounded p-2 hover:bg-gray-200">
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/admin/users"
              className="block rounded p-2 hover:bg-gray-200"
            >
              Users
            </a>
          </li>
          <li>
            <a
              href="/admin/settings"
              className="block rounded p-2 hover:bg-gray-200"
            >
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
