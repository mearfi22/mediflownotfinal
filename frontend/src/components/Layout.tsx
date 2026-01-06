import React, { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import ConfirmDialog from "./ConfirmDialog";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  UserCircleIcon,
  BuildingOfficeIcon,

  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Patients", href: "/patients", icon: UsersIcon },
    { name: "Queue", href: "/queue", icon: ClipboardDocumentListIcon },
    {
      name: "Medical Records",
      href: "/medical-records",
      icon: DocumentTextIcon,
    },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    ...(user?.role === "admin" ? [
      { name: "User Management", href: "/user-management", icon: UserCircleIcon },
      { name: "Department Management", href: "/department-management", icon: BuildingOfficeIcon },
      { name: "Audit Logs", href: "/audit-logs", icon: DocumentMagnifyingGlassIcon },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-red-50/20">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-medium border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Mediflow
                </span>
                <p className="text-[10px] text-gray-500 font-medium">Hospital Management</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-column max-w-xs w-full bg-white shadow-strong rounded-r-3xl">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col h-full pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <span className="text-white font-bold text-2xl">M</span>
                </div>
                <div className="ml-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Mediflow
                  </span>
                  <p className="text-xs text-gray-500 font-medium">Hospital Management</p>
                </div>
              </div>
              
              <nav className="px-4 space-y-1.5 flex-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    <span className="font-semibold">{item.name}</span>
                  </NavLink>
                ))}
              </nav>
              
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.role === "doctor" && (user as any).doctor?.full_name ? (user as any).doctor.full_name : user?.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize font-medium">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="ml-2 p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:block">
        <div className="flex flex-col h-full bg-white shadow-strong border-r border-gray-100">
          <div className="flex items-center h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-primary-600/5 to-secondary-600/5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Mediflow
                </span>
                <p className="text-[10px] text-gray-500 font-medium">Hospital Management System</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 px-4 flex-1 overflow-y-auto">
            <ul className="space-y-1.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-semibold">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 pt-16 lg:pt-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline bg-gradient-to-r from-gray-900 via-primary-800 to-secondary-800 bg-clip-text text-transparent">
                  Roxas Memorial Provincial Hospital
                </span>
                <span className="sm:hidden">RMPH</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block font-medium">Healthcare Excellence Through Innovation</p>
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <NotificationBell />
              
              <Link
                to="/profile"
                className="flex items-center space-x-3 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.role === "doctor" && (user as any).doctor?.full_name ? (user as any).doctor.full_name : user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{user?.role}</p>
                </div>
              </Link>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        type="warning"
      />
    </div>
  );
};

export default Layout;