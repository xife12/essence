'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, AlertTriangle, Target, BarChart2 
} from 'lucide-react';

// Mock-Daten für Demo
const mockData = {
  monthlyComparison: [
    { name: 'Jan', new: 40, cancelled: 24 },
    { name: 'Feb', new: 30, cancelled: 13 },
    { name: 'Mär', new: 20, cancelled: 28 },
    { name: 'Apr', new: 27, cancelled: 18 },
    { name: 'Mai', new: 18, cancelled: 12 },
    { name: 'Jun', new: 23, cancelled: 9 },
  ],
  contractDistribution: [
    { name: 'Standard', value: 40 },
    { name: 'Premium', value: 30 },
    { name: 'Flex', value: 20 },
    { name: 'Student', value: 10 },
  ],
  terminationWarnings: [
    { id: 1, name: 'Max Mustermann', endDate: '15.07.2023', contact: 'max@example.com', contacted: false },
    { id: 2, name: 'Anna Schmidt', endDate: '22.07.2023', contact: '0176 12345678', contacted: true },
    { id: 3, name: 'Tim Müller', endDate: '05.08.2023', contact: 'tim@example.com', contacted: false },
  ],
  campaigns: [
    { name: 'Sommerkampagne', leads: 120, contracts: 34, rate: 28 },
    { name: 'Studenten-Special', leads: 85, contracts: 41, rate: 48 },
  ]
};

// Farben für die Charts
const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
const BAR_COLORS = {
  new: '#3B82F6',
  cancelled: '#EF4444'
};

export default function Dashboard() {
  const [leadsProgress, setLeadsProgress] = useState(68);
  const [membershipGoal, setMembershipGoal] = useState(82);
  
  return (
    <>
      <PageHeader 
        title="Dashboard" 
        breadcrumb={['Home', 'Dashboard']}
      />
      
      {/* KPI-Boxen */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Zielerreichung</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{membershipGoal}%</span>
              <span className="flex items-center text-sm text-green-500 font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                +4%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${membershipGoal >= 90 ? 'bg-green-500' : membershipGoal >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${membershipGoal}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Leads Monatsziel</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{leadsProgress}%</span>
              <span className="flex items-center text-sm text-red-500 font-medium">
                <TrendingDown className="h-4 w-4 mr-1" />
                -2%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${leadsProgress >= 90 ? 'bg-green-500' : leadsProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${leadsProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Aktive Kampagnen</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold">{mockData.campaigns.length}</span>
            </div>
            <ul className="space-y-2">
              {mockData.campaigns.map((campaign, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{campaign.name}:</span> {campaign.rate}% Conversion
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Kündigungen</h3>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold">{mockData.terminationWarnings.length}</span>
              <span className="text-sm text-gray-500 ml-2">in 90 Tagen</span>
            </div>
            <ul className="space-y-2">
              {mockData.terminationWarnings.map((warning) => (
                <li key={warning.id} className="text-sm flex items-center">
                  <input 
                    type="checkbox" 
                    checked={warning.contacted}
                    readOnly
                    className="mr-2 h-4 w-4 text-blue-500 rounded"
                  />
                  <span className={warning.contacted ? "line-through text-gray-400" : ""}>
                    {warning.name}: {warning.endDate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Monatsvergleich: Neuzugänge vs. Kündigungen</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockData.monthlyComparison}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="new" name="Neue Mitglieder" fill={BAR_COLORS.new} />
                  <Bar dataKey="cancelled" name="Kündigungen" fill={BAR_COLORS.cancelled} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Vertragsverteilung</h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.contractDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockData.contractDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 