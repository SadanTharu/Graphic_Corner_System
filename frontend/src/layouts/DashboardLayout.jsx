import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <DashboardNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-darker">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
