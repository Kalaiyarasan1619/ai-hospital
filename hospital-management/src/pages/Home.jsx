import React from 'react'
import WelcomePage from '../components/DashboardView/WelcomePage'
import SpecificationPage from '../components/DashboardView/SpecificationPage'
import Branches from '../components/DashboardView/Branches'

const Home = () => {
  return (
    <div>
        <WelcomePage/>
        <br/>
        <SpecificationPage/>
        <br/>
        <Branches/>
    </div>
  )
}

export default Home