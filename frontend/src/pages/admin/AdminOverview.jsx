import { useState, useEffect } from 'react';
import {
  Package, Users, DollarSign, TrendingUp, Clock, Loader2,
  ShoppingCart, CheckCircle, XCircle, Wallet, ArrowUpRight, ArrowDownRight, BarChart3, CalendarDays
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];
const STATUS_COLORS = {
  'Pending': '#F59E0B',
  'Awaiting Advance': '#F97316',
  'In Progress': '#3B82F6',
  'Under Review': '#8B5CF6',
  'Revision': '#EF4444',
  'Awaiting Final': '#EC4899',
  'Completed': '#10B981',
  'Cancelled': '#6B7280'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-darker border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-textGray text-xs mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {typeof item.value === 'number' && item.name?.toLowerCase().includes('revenue')
            ? `LKR ${item.value.toLocaleString()}`
            : item.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle, trend, trendUp }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-textGray text-xs uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
    {subtitle && <p className="text-textGray text-xs mt-1">{subtitle}</p>}
  </div>
);

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const result = await analyticsAPI.getDashboard();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-3">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-textGray text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-textGray">Failed to load analytics</p>
      </div>
    );
  }

  const { summary, payments, charts, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-textGray text-sm mt-1">Real-time business performance overview</p>
        </div>
        <button onClick={fetchAnalytics} className="btn-secondary text-sm flex items-center gap-2 w-fit">
          <BarChart3 className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Revenue"
          value={`LKR ${summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-400"
          bgColor="bg-green-500/10"
          trend={summary.revenueGrowth}
          trendUp={summary.revenueGrowth >= 0}
          subtitle={`This month: LKR ${summary.thisMonthRevenue.toLocaleString()}`}
        />
        <StatCard
          title="Total Orders"
          value={summary.totalOrders}
          icon={ShoppingCart}
          color="text-primary"
          bgColor="bg-primary/10"
          trend={summary.orderGrowth}
          trendUp={summary.orderGrowth >= 0}
          subtitle={`${summary.thisMonthOrders} this month`}
        />
        <StatCard
          title="Active Orders"
          value={summary.activeOrders}
          icon={Package}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          subtitle={`${summary.completedOrders} completed`}
        />
        <StatCard
          title="Customers"
          value={summary.totalCustomers}
          icon={Users}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          subtitle={`${summary.thisMonthNewCustomers} new this month`}
        />
        <StatCard
          title="Avg Order Value"
          value={`LKR ${summary.avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          subtitle={`~${summary.avgCompletionTime}d avg completion`}
        />
        <StatCard
          title="Pending Revenue"
          value={`LKR ${summary.pendingRevenue.toLocaleString()}`}
          icon={Clock}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          subtitle={`${summary.cancelledOrders} cancelled`}
        />
      </div>

      {/* Revenue & Orders Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend (12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#A855F7" fill="url(#revenueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Orders Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Orders Trend (12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution & Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Order Status Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={charts.orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charts.orderStatusDistribution.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[140px]">
              {charts.orderStatusDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[entry.name] || COLORS[index % COLORS.length] }}
                  />
                  <span className="text-textGray">{entry.name}</span>
                  <span className="text-white font-semibold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Service Category */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Revenue by Category</h3>
          {charts.revenueByCategory.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={charts.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.revenueByCategory.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-darker border border-gray-700 rounded-lg p-3 shadow-xl">
                        <p className="text-white text-sm font-semibold">{payload[0].name}</p>
                        <p className="text-primary text-sm">LKR {payload[0].value.toLocaleString()}</p>
                      </div>
                    );
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-[140px]">
                {charts.revenueByCategory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-textGray">{entry.name}</span>
                    <span className="text-white font-semibold ml-auto">LKR {entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-textGray text-sm text-center py-10">No completed orders yet</p>
          )}
        </div>
      </div>

      {/* Daily Orders (30 days) & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Orders Line Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Daily Orders (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={charts.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                interval={4}
              />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">New Customers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="customers" name="Customers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Services & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Services */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Top Services</h3>
          {charts.topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.topServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  width={120}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-darker border border-gray-700 rounded-lg p-3 shadow-xl">
                      <p className="text-white text-sm font-semibold">{d.name}</p>
                      <p className="text-blue-400 text-xs">{d.orders} orders</p>
                      <p className="text-green-400 text-xs">LKR {d.revenue.toLocaleString()} revenue</p>
                    </div>
                  );
                }} />
                <Bar dataKey="orders" name="Orders" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-textGray text-sm text-center py-10">No services data</p>
          )}
        </div>

        {/* Team Performance */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Team Performance</h3>
          {charts.teamPerformance.length > 0 ? (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {charts.teamPerformance.map((member, index) => (
                <div key={index} className="bg-darker rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white text-sm font-semibold">{member.name}</p>
                      <p className="text-textGray text-xs">{member.specialty}</p>
                    </div>
                    <span className="text-green-400 text-xs font-medium">
                      LKR {member.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-textGray">{member.completed} done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-textGray">{member.active} active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-textGray">{member.total} total</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                      style={{ width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textGray text-sm text-center py-10">No team data</p>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Total Collected</span>
          </div>
          <p className="text-xl font-bold text-white">LKR {payments.totalCollected.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">Pending Payments</span>
          </div>
          <p className="text-xl font-bold text-white">{payments.pendingCount}</p>
          <p className="text-textGray text-xs mt-1">LKR {payments.pendingAmount.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Wallet Balance</span>
          </div>
          <p className="text-xl font-bold text-white">LKR {payments.totalWalletBalance.toLocaleString()}</p>
          <p className="text-textGray text-xs mt-1">Top-ups: LKR {payments.totalTopups.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">Services</span>
          </div>
          <p className="text-xl font-bold text-white">{summary.totalServices}</p>
          <p className="text-textGray text-xs mt-1">{summary.totalTeamMembers} team members</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <span className="text-textGray text-xs">Last 10 orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">#</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Customer</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Service</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Status</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Amount</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Assigned</th>
                <th className="text-left text-textGray font-medium py-3 px-4 text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statusColorMap = {
                  completed: 'bg-green-500/20 text-green-400',
                  cancelled: 'bg-red-500/20 text-red-400',
                  in_progress: 'bg-blue-500/20 text-blue-400',
                  pending: 'bg-yellow-500/20 text-yellow-400',
                  review: 'bg-purple-500/20 text-purple-400',
                  awaiting_advance: 'bg-orange-500/20 text-orange-400',
                  awaiting_final: 'bg-pink-500/20 text-pink-400',
                  revision_requested: 'bg-red-500/20 text-red-400'
                };
                return (
                  <tr key={order._id} className="border-b border-gray-800 hover:bg-darker transition-colors">
                    <td className="py-3 px-4 text-white text-sm">#{order.orderNumber}</td>
                    <td className="py-3 px-4 text-white text-sm">{order.customer}</td>
                    <td className="py-3 px-4 text-textGray text-sm">{order.service}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColorMap[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white text-sm font-semibold">
                      LKR {order.totalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-textGray text-sm">{order.assignedTo}</td>
                    <td className="py-3 px-4 text-textGray text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-textGray">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
