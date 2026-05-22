import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import LoadingScreen from "../pages/LoadingScreen";
import { roleHome } from "./routeUtils";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { account, status } = useAuth();

  if (status === "checking") {
    return <LoadingScreen label="Checking account access" />;
  }

  if (status !== "assigned" || !account) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(account.role)) {
    return <Navigate to={roleHome(account.role)} replace />;
  }

  return children;
}
