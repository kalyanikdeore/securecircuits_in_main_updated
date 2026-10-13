import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProfileCompleteRoute() {
    const savedCustomer = localStorage.getItem("customer");

    // Customer login केलेला नाही
    if (!savedCustomer) {
        return <Navigate to="/login" replace />;
    }

    let customer;

    try {
        customer = JSON.parse(savedCustomer);
    } catch (error) {
        console.error("Invalid customer data:", error);

        localStorage.removeItem("customer");

        return <Navigate to="/login" replace />;
    }

    // Customer ID नाही
    if (!customer?.cust_id) {
        localStorage.removeItem("customer");

        return <Navigate to="/login" replace />;
    }

    // ==========================================
    // PROFILE INCOMPLETE
    // ==========================================

    if (Number(customer.cust_profile_update) !== 1) {
        return (
            <Navigate
                to="/customer/profile"
                replace
            />
        );
    }

    // ==========================================
    // PROFILE COMPLETE
    // ==========================================

    return <Outlet />;
}

export default ProfileCompleteRoute;