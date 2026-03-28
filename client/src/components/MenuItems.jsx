import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";

const MenuItems = ({ setSidebarOpen }) => {
  return (
    <div className="px-4 space-y-0.5 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
              <span className="tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
