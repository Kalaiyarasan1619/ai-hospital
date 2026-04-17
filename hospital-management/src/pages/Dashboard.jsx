import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserMd } from "react-icons/fa";
import TodayDetails from "../components/DashBoard/TodayDetails";
import TodayOutpatientDetails from "../components/DashBoard/TodayOutpatientDetails";
import TodayInpatientDetails from "../components/DashBoard/TodayInpatientDetails";
import DashboardDoctorAssignmentModal from "../components/Patient/DashboardDoctorAssignmentModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [preselectedPatient, setPreselectedPatient] = useState(null);

  useEffect(() => {
    if (!location.state?.openDashboardVisitModal) return;

    setIsVisitModalOpen(true);
    setPreselectedPatient(location.state?.preselectedPatient || null);

    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsVisitModalOpen(true)}
          className="bg-gradient-to-r from-sky-400 to-pink-300 text-white px-5 py-2.5 rounded-lg shadow hover:shadow-md hover:from-sky-500 hover:to-pink-400 transition-all flex items-center gap-2"
        >
          <FaUserMd className="h-4 w-4" />
          Today Patient Visit
        </button>
      </div>

      <TodayDetails />
      <TodayOutpatientDetails />
      <TodayInpatientDetails />

      {isVisitModalOpen && (
        <DashboardDoctorAssignmentModal
          isOpen={isVisitModalOpen}
          onClose={() => {
            setIsVisitModalOpen(false);
            setPreselectedPatient(null);
          }}
          preselectedPatient={preselectedPatient}
        />
      )}
    </div>
  );
};

export default Dashboard;