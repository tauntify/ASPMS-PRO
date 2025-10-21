import { Division, Item, ProjectSummary } from "@shared/schema";
import { BarChart3, Building2, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ExportDashboardProps {
  projectName: string;
  divisions: Division[];
  items: Item[];
  summary: ProjectSummary;
}

export function ExportDashboard({ projectName, divisions, items, summary }: ExportDashboardProps) {
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
