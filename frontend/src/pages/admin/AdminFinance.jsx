import { TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { financialData } from '../../data';

const AdminFinance = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: `LKR ${financialData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Pending Payments',
      value: `LKR ${financialData.pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: '-5.2%',
      isPositive: true
    },
    {
      title: 'Monthly Growth',
      value: `${financialData.monthlyGrowth}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+2.1%',
      isPositive: true
    },
    {
      title: 'Target Achievement',
      value: `${Math.round((financialData.actualSales / financialData.targetSales) * 100)}%`,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '83.3%',
      isPositive: false
    }
  ];

  const COLORS = ['#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-lightGray border border-gray-700 p-3 rounded-lg shadow-lg">
          {payload.map((entry, index) => (
            <p key={index} className="text-white text-sm">
              <span className="font-semibold">{entry.name}:</span> LKR{' '}
              {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-lightGray border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white text-sm font-semibold">{payload[0].name}</p>
          <p className="text-primary">LKR {payload[0].value.toLocaleString()}</p>
          <p className="text-textGray text-xs">{payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Financial Overview</h2>
        <p className="text-textGray mt-2">Track revenue, expenses, and financial performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    stat.isPositive ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-textGray text-sm">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Target vs Actual */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Target vs Actual Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#B0B0B0" />
              <YAxis stroke="#B0B0B0" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="target" fill="#E63946" name="Target" radius={[8, 8, 0, 0]} />
              <Bar dataKey="actual" fill="#4CAF50" name="Actual" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Revenue by Service */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Revenue by Service Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialData.revenueByService}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {financialData.revenueByService.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {financialData.revenueByService.map((service, index) => (
              <div key={service.name} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{service.name}</p>
                  <p className="text-textGray text-xs">
                    LKR {service.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Recent Financial Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-textGray font-medium py-3 px-4">Date</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Description</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Type</th>
                <th className="text-right text-textGray font-medium py-3 px-4">Amount</th>
                <th className="text-right text-textGray font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 hover:bg-darker transition-colors">
                <td className="py-3 px-4 text-white">2026-02-14</td>
                <td className="py-3 px-4 text-white">Order #3 - Final Payment</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    Income
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-green-500 font-semibold">
                  +LKR 3,750
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-darker transition-colors">
                <td className="py-3 px-4 text-white">2026-02-12</td>
                <td className="py-3 px-4 text-white">Order #2 - Advance Payment</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    Income
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-green-500 font-semibold">
                  +LKR 1,625
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-800 hover:bg-darker transition-colors">
                <td className="py-3 px-4 text-white">2026-02-10</td>
                <td className="py-3 px-4 text-white">Software Subscription</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded">
                    Expense
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-red-500 font-semibold">
                  -LKR 12,500
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    Paid
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
