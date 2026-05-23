import { useEffect } from "react";
import { mountAssignmentDashboard } from "../../app";

export default function useAssignmentDashboard(options = {}) {
  const visibleStudentKeys = options.visibleStudentKeys || null;
  const visibleStudentKeySignature = visibleStudentKeys?.join("|") || "";
  const accountSignature = options.account
    ? `${options.account.uid || ""}:${options.account.role || ""}`
    : "";

  useEffect(() => {
    if (options.enabled === false) return undefined;
    return mountAssignmentDashboard({ account: options.account || null, visibleStudentKeys });
  }, [options.enabled, visibleStudentKeySignature, accountSignature]);
}
