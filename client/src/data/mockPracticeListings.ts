// Mock practice listings for development
export const mockPracticeListings = [
  {
    id: 'listing-1',
    practiceName: 'Capital Advisors LLC',
    location: 'New York, NY',
    revenue: '1.5M',
    aum: '150M',
    clientCount: 120,
    status: 'active',
    inquiries: 5,
    description: 'Established financial planning practice with strong client base',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-2',
    practiceName: 'Mountain Financial Partners',
    location: 'Denver, CO',
    revenue: '850K',
    aum: '90M',
    clientCount: 85,
    status: 'pending',
    inquiries: 3,
    description: 'Fee-only financial planning practice specializing in retirement planning',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-3',
    practiceName: 'Coastal Wealth Management',
    location: 'San Diego, CA',
    revenue: '2.2M',
    aum: '220M',
    clientCount: 175,
    status: 'active',
    inquiries: 8,
    description: 'Comprehensive wealth management firm focusing on high-net-worth individuals',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-4',
    practiceName: 'Sunbelt Retirement Specialists',
    location: 'Tampa, FL',
    revenue: '1.1M',
    aum: '110M',
    clientCount: 95,
    status: 'review',
    inquiries: 2,
    description: 'Retirement planning practice specializing in Florida retirees',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-5',
    practiceName: 'Midwest Planning Group',
    location: 'Chicago, IL',
    revenue: '1.8M',
    aum: '190M',
    clientCount: 140,
    status: 'active',
    inquiries: 6,
    description: 'Holistic financial planning practice with strong insurance focus',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-6',
    practiceName: 'Cornerstone Advisors',
    location: 'Seattle, WA',
    revenue: '2.5M',
    aum: '280M',
    clientCount: 200,
    status: 'active',
    inquiries: 9,
    description: 'Comprehensive wealth management for tech executives',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-7',
    practiceName: 'Atlas Financial Solutions',
    location: 'Austin, TX',
    revenue: '1.3M',
    aum: '145M',
    clientCount: 110,
    status: 'pending',
    inquiries: 4,
    description: 'Financial planning for entrepreneurs and small business owners',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-8',
    practiceName: 'Executive Wealth Partners',
    location: 'Boston, MA',
    revenue: '3.2M',
    aum: '350M',
    clientCount: 180,
    status: 'active',
    inquiries: 7,
    description: 'Specialized wealth management for corporate executives',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-9',
    practiceName: 'Southern Trust Advisors',
    location: 'Atlanta, GA',
    revenue: '1.7M',
    aum: '165M',
    clientCount: 130,
    status: 'review',
    inquiries: 3,
    description: 'Comprehensive financial planning with estate planning focus',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-10',
    practiceName: 'Pacific Wealth Strategies',
    location: 'Portland, OR',
    revenue: '1.4M',
    aum: '125M',
    clientCount: 105,
    status: 'active',
    inquiries: 5,
    description: 'Holistic financial planning with sustainable investing focus',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-11',
    practiceName: 'Horizon Financial Group',
    location: 'Minneapolis, MN',
    revenue: '1.9M',
    aum: '200M',
    clientCount: 150,
    status: 'active',
    inquiries: 4,
    description: 'Financial planning for healthcare professionals',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'listing-12',
    practiceName: 'Desert Financial Partners',
    location: 'Phoenix, AZ',
    revenue: '1.2M',
    aum: '135M',
    clientCount: 95,
    status: 'pending',
    inquiries: 2,
    description: 'Retirement income planning specialists',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to get mock listings with format matching API response
export const getMockPracticeListings = () => {
  return {
    listings: mockPracticeListings,
    count: mockPracticeListings.length,
    pending: mockPracticeListings.filter(l => l.status === 'pending' || l.status === 'review').length
  };
};