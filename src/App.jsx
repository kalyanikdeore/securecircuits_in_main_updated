import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

/* ================= ADMIN ================= */
import Sidebar from "./Admin/Sidebar";
import Header from "./Admin/Header";
import Footer from "./Admin/Footer";
import Login from "./Admin/Login";
import Dashboard from "./Admin/Dashboard";
import Customers from "./Admin/Customers";
import Staff from "./Admin/Staff";
import Orders from "./Admin/Orders";
import Delivered from "./Admin/Delivered";
import Dispatches from "./Admin/Dispatches";
import Quotations from "./Admin/Quotations";
import Setting from "./Admin/Setting";
import Profile from "./Admin/Profile";
import Approved from "./Admin/Approved";
import Suppliers from "./Admin/Suppliers";

/* ================= USERS ================= */
import Pdf from "./Users/Pdf";
import Home from "./Users/Home";
import About from "./Users/About";
import Contact from "./Users/Contact";
import Header_home from "./Users/Header";
import Header_footer from "./Users/Footer";
import Whychoose from "./Users/Why_choose";
import Services from "./Users/Services";
import CustLogin from "./Users/Login";
import GerberUpload from "./Users/GerberUpload2";
import Cart from "./Users/Cart";
import VerifyEmail from "./Users/VerifyEmail";

/* ================= CUSTOMER ================= */
import CustSidebar from "./Customer/Sidebar";
import CustHeader from "./Customer/Header";
import CustFooter from "./Customer/Footer";
import CustResetpass from "./Customer/Resetpass";
import CustProfile from "./Customer/Profile";
import CustDashboard from "./Customer/Dashboard";
import CustOrders from "./Customer/Orders";
import CustDelivered from "./Customer/Delivered";
import CustQuotations from "./Customer/Quotations";
import CustSaveqQuote from "./Customer/Saved";
import ProfileCompleteRoute from "./Customer/ProfileCompleteRoute";

/* ================= SUPPLIER ================= */
import SuppSidebar from "./Supplier/Sidebar";
import SuppHeader from "./Supplier/Header";
import SuppFooter from "./Supplier/Footer";
import SuppLogin from "./Supplier/Login";
import SuppResetpass from "./Supplier/Resetpass";
import SuppDashboard from "./Supplier/Dashboard";
import SuppOrders from "./Supplier/Orders";
import SuppQuotations from "./Supplier/Quotations";
import SuppDispatches from "./Supplier/Dispatches";
import SuppProfile from "./Supplier/Profile";
import SuppApproved from "./Supplier/Approved";

/* =========================================================
   ADMIN LAYOUT
========================================================= */

const AdminLayout = () => (
  <div className="admin-shell">
    <Sidebar />

    <div className="admin-main">
      <Header />

      <main className="dashboard-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  </div>
);

/* =========================================================
   CUSTOMER LAYOUT
========================================================= */

const CustomerProfileGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const customerData = localStorage.getItem("customer");

    if (!customerData) {
      navigate("/login", { replace: true });
      return;
    }

    let customer = {};

    try {
      customer = JSON.parse(customerData);
    } catch (error) {
      console.error("Invalid customer data:", error);

      localStorage.removeItem("customer");

      navigate("/login", { replace: true });
      return;
    }

    if (!customer?.cust_id) {
      localStorage.removeItem("customer");

      navigate("/login", { replace: true });
      return;
    }


    if (location.pathname === "/customer/profile") {
      return;
    }


    if (Number(customer.cust_profile_update) === 0) {
      toast.error("Please complete your profile first", {
        id: "profile-incomplete",
        duration: 4000,
      });

      navigate("/customer/profile", {
        replace: true,
      });
    }
  }, [location.pathname, navigate]);

  return null;
};

const CustomerLayout = () => (
  <div className="admin-shell">

    <CustomerProfileGuard />

    <CustSidebar />

    <div className="admin-main">

      <CustHeader />

      <main className="dashboard-content">
        <Outlet />
      </main>

      <CustFooter />

    </div>

  </div>
);

/* =========================================================
   SUPPLIER LAYOUT
========================================================= */

const SupplierLayout = () => (
  <div className="admin-shell">
    <SuppSidebar />

    <div className="admin-main">
      <SuppHeader />

      <main className="dashboard-content">
        <Outlet />
      </main>

      <SuppFooter />
    </div>
  </div>
);

/* =========================================================
   USER WEBSITE LAYOUT
========================================================= */

const UsesLayout = () => (
  <>
    <Header_home />
    <Outlet />
    <Header_footer />
  </>
);

/* =========================================================
   MAIN APP
========================================================= */

function MainApp() {
  return (
    <Routes>

      {/* =====================================================
          PDF
      ===================================================== */}

      <Route path="/pdf" element={<Pdf />} />

      {/* =====================================================
          PUBLIC USER WEBSITE
      ===================================================== */}

      <Route element={<UsesLayout />}>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route
          path="/order-now"
          element={<GerberUpload />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/why-choose"
          element={<Whychoose />}
        />

        <Route
          path="/services/:service"
          element={<Services />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/login"
          element={<CustLogin />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

      </Route>

      {/* =====================================================
          ADMIN LOGIN
      ===================================================== */}

      <Route
        path="/backend"
        element={<Login />}
      />

      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route element={<AdminLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/staff"
          element={<Staff />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/approved"
          element={<Approved />}
        />

        <Route
          path="/delivered"
          element={<Delivered />}
        />

        <Route
          path="/quotations"
          element={<Quotations />}
        />

        <Route
          path="/dispatches"
          element={<Dispatches />}
        />

        <Route
          path="/setting"
          element={<Setting />}
        />

        <Route
          path="/suppliers"
          element={<Suppliers />}
        />

      </Route>

      {/* =====================================================
          CUSTOMER RESET PASSWORD
      ===================================================== */}

      {/* ================= CUSTOMER RESET PASSWORD ================= */}

      <Route
        path="/customer/reset-password"
        element={<CustResetpass />}
      />


      {/* ================= CUSTOMER ================= */}

      <Route element={<CustomerLayout />}>

        {/* ==========================================
      CUSTOMER PROFILE

      Profile page always accessible after login.
      Even when cust_profile_update = 0.
  ========================================== */}

        <Route
          path="/customer/profile"
          element={<CustProfile />}
        />


        {/* ==========================================
      PROFILE COMPLETION REQUIRED

      These pages are accessible only when:

      cust_profile_update = 1
  ========================================== */}

        <Route element={<ProfileCompleteRoute />}>

          <Route
            path="/customer/dashboard"
            element={<CustDashboard />}
          />

          <Route
            path="/customer/orders"
            element={<CustOrders />}
          />

          <Route
            path="/customer/quotations"
            element={<CustQuotations />}
          />

          <Route
            path="/customer/delivered"
            element={<CustDelivered />}
          />

          <Route
            path="/customer/saved-cart"
            element={<CustSaveqQuote />}
          />

        </Route>

      </Route>

      {/* =====================================================
          SUPPLIER LOGIN
      ===================================================== */}

      <Route
        path="/user-auth/login"
        element={<SuppLogin />}
      />

      <Route
        path="/user-auth/reset-password"
        element={<SuppResetpass />}
      />

      {/* =====================================================
          SUPPLIER
      ===================================================== */}

      <Route element={<SupplierLayout />}>

        <Route
          path="/user-auth/dashboard"
          element={<SuppDashboard />}
        />

        <Route
          path="/user-auth/profile"
          element={<SuppProfile />}
        />

        <Route
          path="/user-auth/orders"
          element={<SuppOrders />}
        />

        <Route
          path="/user-auth/approved"
          element={<SuppApproved />}
        />

        <Route
          path="/user-auth/quotations"
          element={<SuppQuotations />}
        />

        <Route
          path="/user-auth/dispatches"
          element={<SuppDispatches />}
        />

      </Route>

    </Routes>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,

          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 50px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          },
        }}
      />

      <BrowserRouter basename="/">
        <MainApp />
      </BrowserRouter>
    </>
  );
}

export default App;