// Mock Data removed - Application now uses real database data via API
// Only keeping essential UI configuration data

export const statusSteps = [
  { step: 1, label: 'Pending Approval' },
  { step: 2, label: 'Advance Payment (25%)' },
  { step: 3, label: 'Work in Progress' },
  { step: 4, label: 'Review Watermark' },
  { step: 5, label: 'Final Payment' },
  { step: 6, label: 'Completed' }
];

// Packages feature not yet implemented in backend - empty array
export const packages = [];

// Financial data removed - calculated from real orders
export const financialData = {
  totalRevenue: 0,
  pendingPayments: 0,
  monthlyGrowth: 0,
  actualSales: 0,
  targetSales: 0,
  monthlyData: [],
  revenueByService: []
};
