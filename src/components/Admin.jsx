import { ROLES } from "../constants/roles";
import Dashboard from "./Dashboard";

export default function Admin() {
  return <Dashboard role={ROLES.ADMIN} />;
}