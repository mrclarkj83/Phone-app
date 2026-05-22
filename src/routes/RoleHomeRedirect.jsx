import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import LoadingScreen from "../pages/LoadingScreen";
import { roleHome } from "./routeUtils";

export default function RoleHomeRedirect() {
  const { account, status } = useAuth();

  if (status === "checking") {
    return <LoadingScreen label="Loading your account" />;
  }

  if (status !== "assigned" || !account) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHome(account.role)} replace />;
}
