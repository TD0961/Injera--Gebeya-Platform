import React from "react";
import RecentOrders from "./UserDasboardNotifications";
import Notifications from "./UserDashboardRecentOrders";

function DashboardContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <RecentOrders />

      {/* Notifications */}
      <Notifications />
    </div>
  );
}

export default DashboardContent;