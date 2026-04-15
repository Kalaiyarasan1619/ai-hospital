import React from 'react'
import Navbar from '../components/DashboardView/Navbar'
import Slidebar from '../components/DashboardView/Slidebar'
import WelcomePage from '../components/DashboardView/WelcomePage'
import TodayDetails from '../components/DashBoard/TodayDetails'
import TodayOutpatientDetails from '../components/DashBoard/TodayOutpatientDetails'
import TodayInpatientDetails from '../components/DashBoard/TodayInpatientDetails'

const Dashboard = () => {
  return (
    <div>
       <TodayDetails/>
       <TodayOutpatientDetails/>
       <TodayInpatientDetails/>
    </div>
  )
}

export default Dashboard