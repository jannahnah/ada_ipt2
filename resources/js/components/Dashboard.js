import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STATIC = {
  students: 1240,
  faculty: 72,
  departments: 8,
  academicYear: '2025/2026',
  // student counts by month for the line chart (growth trend)
  growth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    data: [900, 920, 950, 980, 1020, 1060, 1100, 1140, 1180, 1240]
  },
  // student distribution by department for pie
  byDepartment: {
    labels: ['Computer Sci', 'Business', 'Engineering', 'Arts', 'Science', 'Law', 'Medicine', 'Education'],
    data: [320, 180, 150, 120, 110, 90, 150, 120]
  },
  // students per course for bar chart (sample courses)
  byCourse: {
    labels: ['CS101', 'BUS201', 'ENG301', 'ART105', 'SCI210', 'LAW101', 'MED201', 'EDU110'],
    data: [120, 95, 80, 60, 55, 45, 100, 65]
  }
};

export default function Dashboard() {
  const lineData = {
    labels: STATIC.growth.labels,
    datasets: [
      {
        label: 'Students (total)',
        data: STATIC.growth.data,
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const pieData = {
    labels: STATIC.byDepartment.labels,
    datasets: [
      {
        data: STATIC.byDepartment.data,
        backgroundColor: ['#36a2eb','#ff9f40','#4bc0c0','#9966ff','#f67019','#c9cbcf','#ff6384','#8bd3c7'],
        hoverOffset: 6
      }
    ]
  };

  const barData = {
    labels: STATIC.byCourse.labels,
    datasets: [
      {
        label: 'Students per course',
        data: STATIC.byCourse.data,
        backgroundColor: '#36a2eb'
      }
    ]
  };

  return (
    <div className="module-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="muted">Overview and trends</p>
      </div>

      <div className="dashboard-summary" style={{display:'flex',gap:20,marginBottom:24}}>
        <div className="summary-card" style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',flex:1}}>
          <div className="label">Students</div>
          <div className="value" style={{fontSize:28,fontWeight:700}}>{STATIC.students}</div>
        </div>
        <div className="summary-card" style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',flex:1}}>
          <div className="label">Faculty</div>
          <div className="value" style={{fontSize:28,fontWeight:700}}>{STATIC.faculty}</div>
        </div>
        <div className="summary-card" style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',flex:1}}>
          <div className="label">Departments</div>
          <div className="value" style={{fontSize:28,fontWeight:700}}>{STATIC.departments}</div>
        </div>
        <div className="summary-card" style={{padding:16,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',flex:1}}>
          <div className="label">Academic Year</div>
          <div className="value" style={{fontSize:18,fontWeight:600}}>{STATIC.academicYear}</div>
        </div>
      </div>

      <div className="dashboard-charts" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <div className="chart-card" style={{padding:16,background:'#fff',borderRadius:8}}>
          <h3 style={{marginTop:0}}>Student growth (monthly)</h3>
          <Line data={lineData} />
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div className="chart-card" style={{padding:16,background:'#fff',borderRadius:8}}>
            <h3 style={{marginTop:0}}>Students by department</h3>
            <Pie data={pieData} />
          </div>

          <div className="chart-card" style={{padding:16,background:'#fff',borderRadius:8}}>
            <h3 style={{marginTop:0}}>Students per course</h3>
            <Bar data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
}

