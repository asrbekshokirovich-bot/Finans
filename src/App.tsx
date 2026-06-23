import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Accounts from "./pages/Accounts";
import Workers from "./pages/Workers";
import Payments from "./pages/Payments";
import Reporting from "./pages/Reporting";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="add" element={<AddTransaction />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reporting" element={<Reporting />} />
        <Route path="reports" element={<Reports />} />
        <Route path="payments" element={<Payments />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="workers" element={<Workers />} />
      </Route>
    </Routes>
  );
}
