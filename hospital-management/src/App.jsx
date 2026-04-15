// App.jsx - Simple version
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Navbar from './components/DashboardView/Navbar'
import Slidebar from './components/DashboardView/Slidebar'
import Home from './pages/Home'
import Footer from './components/DashboardView/Footer'
import Patients from './pages/Patients'
import PatientsRegisterView from './components/Patient/PatientsRegisterView'
import RegisterPatientDetails from './components/Patient/RegisterPatientDetails'
import Doctors from './pages/Doctors'
import AddDoctors from './components/DoctorPageView/AddDoctors'
import Appointment from './pages/Appointment'
import ViewDoctor from './components/DoctorPageView/ViewDoctor'
import PatientDetailsEdit from './components/Patient/PatientDetailsEdit'
import PatientDoctorVistory from './components/Patient/PatientDoctorVistory'
import Pharmacy from './pages/Pharmacy'
import AiAssistant from './pages/AiAssistant'

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        
        <div className="flex pt-16"> {/* pt-16 for navbar height */}
          {/* Fixed Sidebar */}
          <div className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40">
            <Slidebar 
              isCollapsed={isSidebarCollapsed} 
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
          
          {/* Main Content with dynamic margin */}
          <div className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-72'
          }`}>
            <div className="p-6">
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/home' element={<Home/>} />
                <Route path='/dashboard' element={<Dashboard/>}/>
                <Route path='/patient' element={<Patients/>}/>
                <Route path='/patients/register' element={<PatientsRegisterView/>}/>
                <Route path='/patients/:patientId' element={<RegisterPatientDetails/>}/>
                <Route path='/patients/edit/:patientId' element={<PatientDetailsEdit/>}/>
                <Route path='/patients/view_histroy/:patientId' element={<PatientDoctorVistory/>}/>
                <Route path='/doctors' element={<Doctors/>}/>
                <Route path='/doctors/add' element={<AddDoctors/>}/>
                <Route path='/doctors/:id' element= {<ViewDoctor/>}/>
                <Route path='/appointments' element={<Appointment/>}/>
                <Route path='/pharmacy' element={<Pharmacy/>}/>
                <Route path='/ai-assistant' element={<AiAssistant/>}/>
              </Routes>
            </div>
          </div>
        </div>
          
         <div>
          <Footer/>
         </div>

      </div>
    </BrowserRouter>
  )
}

export default App
