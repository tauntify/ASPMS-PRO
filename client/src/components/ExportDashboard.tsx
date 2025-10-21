import { Division, Item, ProjectSummary, Project } from "@shared/schema";
import { BarChart3, Building2, TrendingUp, CheckCircle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ExportTemplateType } from "./ExportModal";

interface ExportDashboardProps {
  project: Project;
  projectName: string;
  divisions: Division[];
  items: Item[];
  summary: ProjectSummary;
  templateType: ExportTemplateType;
}

export function ExportDashboard({ project, projectName, divisions, items, summary, templateType }: ExportDashboardProps) {
  const priorityData = [
    { name: "High Priority", value: Number(summary.highPriorityCost), color: "#ff3366" },
    { name: "Mid Priority", value: Number(summary.midPriorityCost), color: "#ffaa00" },
    { name: "Low Priority", value: Number(summary.lowPriorityCost), color: "#00ff88" },
  ].filter(item => item.value > 0);

  const divisionData = summary.divisionBreakdown.map(div => ({
    name: div.divisionName.length > 15 ? div.divisionName.substring(0, 15) + '...' : div.divisionName,
    cost: Number(div.totalCost),
  }));

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('en-PK')} PKR`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateProgress = () => {
    if (items.length === 0) return 0;
    const statusWeights = {
      'Not Started': 0,
      'Purchased': 25,
      'In Installation Phase': 50,
      'Installed': 75,
      'Delivered': 100
    };
    const totalProgress = items.reduce((sum, item) => {
      return sum + (statusWeights[item.status as keyof typeof statusWeights] || 0);
    }, 0);
    return Math.round(totalProgress / items.length);
  };

  // BOQ Template (Bill of Quantities)
  if (templateType === 'boq') {
    return (
      <div 
        id="export-dashboard" 
        style={{
          width: '1920px',
          minHeight: '1080px',
          background: '#ffffff',
          padding: '60px',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          position: 'absolute',
          left: '-9999px',
          top: '0',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '4px solid #2c3e50', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, marginBottom: '10px', color: '#2c3e50' }}>
            BILL OF QUANTITIES
          </h1>
          <div style={{ fontSize: '24px', color: '#555', marginBottom: '10px' }}>{projectName}</div>
          {project.clientName && (
            <div style={{ fontSize: '18px', color: '#777' }}>Client: {project.clientName}</div>
          )}
          <div style={{ fontSize: '16px', color: '#999', marginTop: '10px' }}>
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Summary Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr 1fr', 
          gap: '20px', 
          marginBottom: '40px',
          padding: '30px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Cost</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
              {formatCurrency(Number(summary.totalCost))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>High Priority</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>
              {formatCurrency(Number(summary.highPriorityCost))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Mid Priority</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>
              {formatCurrency(Number(summary.midPriorityCost))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Low Priority</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
              {formatCurrency(Number(summary.lowPriorityCost))}
            </div>
          </div>
        </div>

        {/* BOQ Table */}
        {divisions.map(division => {
          const divisionItems = items.filter(item => item.divisionId === division.id);
          if (divisionItems.length === 0) return null;

          return (
            <div key={division.id} style={{ marginBottom: '50px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#2c3e50',
                borderBottom: '2px solid #3498db',
                paddingBottom: '10px'
              }}>
                {division.name}
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#34495e', color: '#fff' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '16px', width: '5%' }}>#</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '16px', width: '35%' }}>Description</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '16px', width: '10%' }}>Unit</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontSize: '16px', width: '12%' }}>Quantity</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontSize: '16px', width: '15%' }}>Rate (PKR)</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '16px', width: '10%' }}>Priority</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontSize: '16px', width: '18%' }}>Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {divisionItems.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{index + 1}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{item.description}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right' }}>{Number(item.quantity).toLocaleString('en-PK')}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right' }}>{Number(item.rate).toLocaleString('en-PK')}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: item.priority === 'High' ? '#e74c3c' : item.priority === 'Mid' ? '#f39c12' : '#27ae60',
                          color: '#fff'
                        }}>
                          {item.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold' }}>
                        {(Number(item.quantity) * Number(item.rate)).toLocaleString('en-PK')}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#ecf0f1', fontWeight: 'bold' }}>
                    <td colSpan={6} style={{ padding: '15px', fontSize: '16px', textAlign: 'right' }}>
                      {division.name} Subtotal:
                    </td>
                    <td style={{ padding: '15px', fontSize: '16px', textAlign: 'right' }}>
                      {divisionItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0).toLocaleString('en-PK')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Grand Total */}
        <div style={{
          marginTop: '40px',
          padding: '25px',
          background: '#2c3e50',
          color: '#fff',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>GRAND TOTAL</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{formatCurrency(Number(summary.totalCost))}</div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '60px', 
          paddingTop: '20px', 
          borderTop: '2px solid #ddd', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ARKA SERVICES</div>
          <div>Professional Architecture & Interior Design Budget Management</div>
        </div>
      </div>
    );
  }

  // Progress Report Template
  if (templateType === 'progress-report') {
    const progress = calculateProgress();
    const statusCounts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div 
        id="export-dashboard" 
        style={{
          width: '1920px',
          minHeight: '1080px',
          background: '#ffffff',
          padding: '60px',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          position: 'absolute',
          left: '-9999px',
          top: '0',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '4px solid #3498db', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, marginBottom: '10px', color: '#2c3e50' }}>
            PROJECT PROGRESS REPORT
          </h1>
          <div style={{ fontSize: '24px', color: '#555', marginBottom: '10px' }}>{projectName}</div>
          {project.projectTitle && (
            <div style={{ fontSize: '18px', color: '#777', marginBottom: '5px' }}>Title: {project.projectTitle}</div>
          )}
          {project.clientName && (
            <div style={{ fontSize: '18px', color: '#777' }}>Client: {project.clientName}</div>
          )}
          <div style={{ fontSize: '16px', color: '#999', marginTop: '10px' }}>
            Report Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Timeline Section */}
        {(project.startDate || project.deliveryDate) && (
          <div style={{ marginBottom: '40px', padding: '30px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
              Project Timeline
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {project.startDate && (
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Start Date</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {formatDate(project.startDate)}
                  </div>
                </div>
              )}
              {project.deliveryDate && (
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Expected Delivery</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {formatDate(project.deliveryDate)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div style={{ marginBottom: '40px', padding: '30px', background: '#ecf0f1', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
            Overall Progress
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(#3498db ${progress * 3.6}deg, #ddd ${progress * 3.6}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                {progress}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} style={{ padding: '15px', background: '#fff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>{status}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>{count} items</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ marginBottom: '40px', padding: '30px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
            Financial Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Budget</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                {formatCurrency(Number(summary.totalCost))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>High Priority</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {formatCurrency(Number(summary.highPriorityCost))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Mid Priority</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {formatCurrency(Number(summary.midPriorityCost))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Low Priority</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {formatCurrency(Number(summary.lowPriorityCost))}
              </div>
            </div>
          </div>
        </div>

        {/* Division Breakdown */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
            Division-wise Progress
          </h2>
          {divisions.map(division => {
            const divisionItems = items.filter(item => item.divisionId === division.id);
            if (divisionItems.length === 0) return null;

            const divisionProgress = divisionItems.length > 0 
              ? Math.round(divisionItems.reduce((sum, item) => {
                  const statusWeights = {
                    'Not Started': 0, 'Purchased': 25, 'In Installation Phase': 50, 'Installed': 75, 'Delivered': 100
                  };
                  return sum + (statusWeights[item.status as keyof typeof statusWeights] || 0);
                }, 0) / divisionItems.length)
              : 0;

            return (
              <div key={division.id} style={{ 
                marginBottom: '25px', 
                padding: '20px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                borderLeft: '5px solid #3498db'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>
                    {division.name}
                  </h3>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                    {divisionProgress}%
                  </div>
                </div>
                <div style={{ 
                  height: '30px', 
                  background: '#ddd', 
                  borderRadius: '15px', 
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${divisionProgress}%`,
                    background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {divisionItems.length} items • Total: {formatCurrency(divisionItems.reduce((sum, item) => 
                    sum + (Number(item.quantity) * Number(item.rate)), 0))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '60px', 
          paddingTop: '20px', 
          borderTop: '2px solid #ddd', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ARKA SERVICES</div>
          <div>Professional Architecture & Interior Design Budget Management</div>
        </div>
      </div>
    );
  }

  // Standard Template (default)
  return (
    <div 
      id="export-dashboard" 
      style={{
        width: '1920px',
        minHeight: '1080px',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        padding: '60px',
        fontFamily: 'Rajdhani, sans-serif',
        color: '#e0e6ed',
        position: 'absolute',
        left: '-9999px',
        top: '0',
      }}
    >
      {/* Header Section */}
      <div style={{ 
        borderBottom: '3px solid #00d9ff',
        paddingBottom: '30px',
        marginBottom: '50px',
        background: 'linear-gradient(90deg, rgba(0,217,255,0.1) 0%, transparent 100%)',
        padding: '30px',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #00d9ff 0%, #7b2ff7 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: 'Orbitron, sans-serif',
            boxShadow: '0 0 30px rgba(0,217,255,0.5)',
          }}>
            <Building2 size={48} />
          </div>
          <div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              fontFamily: 'Orbitron, sans-serif',
              background: 'linear-gradient(90deg, #00d9ff 0%, #7b2ff7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              {projectName}
            </div>
            <div style={{ 
              fontSize: '24px', 
              color: '#8892b0',
              fontFamily: 'Rajdhani, sans-serif',
            }}>
              ARCHITECTURE & INTERIOR DESIGN MANAGEMENT
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '20px',
          fontSize: '16px',
          color: '#8892b0',
          fontFamily: 'Fira Code, monospace',
        }}>
          Report Generated: {new Date().toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' })}
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        marginBottom: '50px',
      }}>
        {/* Total Cost */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(123,47,247,0.1) 100%)',
          border: '2px solid #00d9ff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 0 20px rgba(0,217,255,0.2)',
        }}>
          <div style={{ fontSize: '18px', color: '#8892b0', marginBottom: '10px' }}>TOTAL PROJECT COST</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 'bold',
            fontFamily: 'Fira Code, monospace',
            color: '#00d9ff',
          }}>
            {formatCurrency(Number(summary.totalCost))}
          </div>
        </div>

        {/* Total Items */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,51,102,0.1) 0%, rgba(255,170,0,0.1) 100%)',
          border: '2px solid #ff3366',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 0 20px rgba(255,51,102,0.2)',
        }}>
          <div style={{ fontSize: '18px', color: '#8892b0', marginBottom: '10px' }}>TOTAL ITEMS</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 'bold',
            fontFamily: 'Fira Code, monospace',
            color: '#ff3366',
          }}>
            {summary.totalItems}
          </div>
        </div>

        {/* Total Divisions */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,217,255,0.1) 100%)',
          border: '2px solid #00ff88',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 0 20px rgba(0,255,136,0.2)',
        }}>
          <div style={{ fontSize: '18px', color: '#8892b0', marginBottom: '10px' }}>TOTAL DIVISIONS</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 'bold',
            fontFamily: 'Fira Code, monospace',
            color: '#00ff88',
          }}>
            {summary.totalDivisions}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '50px',
      }}>
        {/* Priority Pie Chart */}
        <div style={{
          background: 'rgba(13,17,23,0.6)',
          border: '1px solid rgba(0,217,255,0.3)',
          borderRadius: '12px',
          padding: '30px',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#00d9ff',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            PRIORITY BREAKDOWN
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={400} height={300}>
              <Pie
                data={priorityData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #00d9ff',
                  borderRadius: '8px',
                  color: '#e0e6ed',
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: '#e0e6ed',
                  fontSize: '14px',
                }}
              />
            </PieChart>
          </div>
          <div style={{ marginTop: '20px', fontSize: '16px', color: '#8892b0' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff3366' }}>●</span> High Priority: {formatCurrency(Number(summary.highPriorityCost))}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ffaa00' }}>●</span> Mid Priority: {formatCurrency(Number(summary.midPriorityCost))}
            </div>
            <div>
              <span style={{ color: '#00ff88' }}>●</span> Low Priority: {formatCurrency(Number(summary.lowPriorityCost))}
            </div>
          </div>
        </div>

        {/* Division Bar Chart */}
        <div style={{
          background: 'rgba(13,17,23,0.6)',
          border: '1px solid rgba(123,47,247,0.3)',
          borderRadius: '12px',
          padding: '30px',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#7b2ff7',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            DIVISION COSTS
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={divisionData}>
              <XAxis 
                dataKey="name" 
                stroke="#8892b0"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#8892b0"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #7b2ff7',
                  borderRadius: '8px',
                  color: '#e0e6ed',
                }}
              />
              <Bar dataKey="cost" fill="#7b2ff7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Items Table */}
      <div style={{
        background: 'rgba(13,17,23,0.6)',
        border: '1px solid rgba(0,217,255,0.3)',
        borderRadius: '12px',
        padding: '30px',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#00d9ff',
          fontFamily: 'Orbitron, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <TrendingUp size={28} />
          DETAILED COST BREAKDOWN
        </div>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{
              background: 'linear-gradient(90deg, rgba(0,217,255,0.2) 0%, rgba(123,47,247,0.2) 100%)',
              borderBottom: '2px solid #00d9ff',
            }}>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>DIVISION</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>DESCRIPTION</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>UNIT</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>QTY</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>RATE</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>TOTAL</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#00d9ff', fontFamily: 'Orbitron, sans-serif' }}>PRIORITY</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const division = divisions.find(d => d.id === item.divisionId);
              const totalCost = Number(item.quantity) * Number(item.rate);
              const priorityColor = 
                item.priority === 'High' ? '#ff3366' :
                item.priority === 'Mid' ? '#ffaa00' : '#00ff88';
              
              return (
                <tr 
                  key={item.id}
                  style={{
                    background: index % 2 === 0 ? 'rgba(0,217,255,0.05)' : 'transparent',
                    borderBottom: '1px solid rgba(136,146,176,0.2)',
                  }}
                >
                  <td style={{ padding: '12px', color: '#8892b0' }}>{division?.name || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#e0e6ed' }}>{item.description}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#8892b0', fontFamily: 'Fira Code, monospace' }}>{item.unit}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#e0e6ed', fontFamily: 'Fira Code, monospace' }}>{Number(item.quantity).toLocaleString('en-PK')}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#e0e6ed', fontFamily: 'Fira Code, monospace' }}>{Number(item.rate).toLocaleString('en-PK')}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#00d9ff', fontWeight: 'bold', fontFamily: 'Fira Code, monospace' }}>
                    {totalCost.toLocaleString('en-PK')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      background: `${priorityColor}22`,
                      color: priorityColor,
                      border: `1px solid ${priorityColor}`,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      fontFamily: 'Orbitron, sans-serif',
                    }}>
                      {item.priority.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '50px',
        paddingTop: '30px',
        borderTop: '2px solid rgba(0,217,255,0.3)',
        textAlign: 'center',
        fontSize: '14px',
        color: '#8892b0',
      }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '18px',
          marginBottom: '10px',
          background: 'linear-gradient(90deg, #00d9ff 0%, #7b2ff7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ARKA SERVICES PROJECT MANAGEMENT
        </div>
        <div>Professional Architecture & Interior Design Budget Management System</div>
      </div>
    </div>
  );
}
