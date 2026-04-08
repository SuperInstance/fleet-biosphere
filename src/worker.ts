interface Vessel {
  id: string;
  type: 'predator' | 'prey' | 'scavenger' | 'producer';
  health: number;
  resources: number;
  position: { x: number; y: number };
  activity: 'hunting' | 'grazing' | 'producing' | 'idle';
}

interface ResourceFlow {
  source: string;
  target: string;
  type: 'energy' | 'materials' | 'data';
  amount: number;
  timestamp: number;
}

interface SustainabilityMetrics {
  fleetHealth: number;
  resourceBalance: number;
  carryingCapacity: number;
  biodiversityIndex: number;
  carbonFootprint: number;
  timestamp: number;
}

class FleetBiosphere {
  private vessels: Map<string, Vessel> = new Map();
  private flows: ResourceFlow[] = [];
  private metrics: SustainabilityMetrics;
  private lastUpdate: number = Date.now();

  constructor() {
    this.metrics = {
      fleetHealth: 85,
      resourceBalance: 100,
      carryingCapacity: 150,
      biodiversityIndex: 0.75,
      carbonFootprint: 42,
      timestamp: Date.now()
    };
    this.initializeEcosystem();
  }

  private initializeEcosystem(): void {
    const vesselTypes: Vessel['type'][] = ['predator', 'prey', 'scavenger', 'producer'];
    
    for (let i = 0; i < 20; i++) {
      const type = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      const vessel: Vessel = {
        id: `vessel-${i}`,
        type,
        health: 70 + Math.random() * 30,
        resources: 30 + Math.random() * 70,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100
        },
        activity: this.getActivityForType(type)
      };
      this.vessels.set(vessel.id, vessel);
    }
  }

  private getActivityForType(type: Vessel['type']): Vessel['activity'] {
    const activities: Record<Vessel['type'], Vessel['activity']> = {
      'predator': 'hunting',
      'prey': 'grazing',
      'scavenger': 'idle',
      'producer': 'producing'
    };
    return activities[type];
  }

  private simulateInteractions(): void {
    const now = Date.now();
    const vesselsArray = Array.from(this.vessels.values());
    
    for (const vessel of vesselsArray) {
      if (vessel.type === 'predator') {
        const prey = vesselsArray.find(v => 
          v.type === 'prey' && 
          this.calculateDistance(vessel.position, v.position) < 10
        );
        
        if (prey && prey.health > 0) {
          const transfer = Math.min(20, prey.resources);
          vessel.resources += transfer;
          prey.resources -= transfer;
          prey.health -= 15;
          
          this.flows.push({
            source: prey.id,
            target: vessel.id,
            type: 'energy',
            amount: transfer,
            timestamp: now
          });
          
          if (prey.health <= 0) {
            this.vessels.delete(prey.id);
          }
        }
      } else if (vessel.type === 'producer') {
        const production = 5 + Math.random() * 10;
        vessel.resources += production;
        
        this.flows.push({
          source: 'environment',
          target: vessel.id,
          type: 'energy',
          amount: production,
          timestamp: now
        });
      }
      
      vessel.resources -= 0.5;
      vessel.health = Math.max(0, Math.min(100, vessel.health + (vessel.resources > 30 ? 0.2 : -0.5)));
    }
    
    this.flows = this.flows.filter(flow => now - flow.timestamp < 60000);
  }

  private calculateDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private updateMetrics(): void {
    const vesselsArray = Array.from(this.vessels.values());
    const now = Date.now();
    const timeDelta = (now - this.lastUpdate) / 1000;
    
    let totalHealth = 0;
    let totalResources = 0;
    const typeCounts = new Map<Vessel['type'], number>();
    
    for (const vessel of vesselsArray) {
      totalHealth += vessel.health;
      totalResources += vessel.resources;
      typeCounts.set(vessel.type, (typeCounts.get(vessel.type) || 0) + 1);
    }
    
    const avgHealth = vesselsArray.length > 0 ? totalHealth / vesselsArray.length : 0;
    const shannonIndex = this.calculateBiodiversityIndex(typeCounts);
    
    this.metrics = {
      fleetHealth: Math.round(avgHealth * 10) / 10,
      resourceBalance: Math.round(totalResources),
      carryingCapacity: Math.min(200, 100 + vesselsArray.length * 2),
      biodiversityIndex: Math.round(shannonIndex * 100) / 100,
      carbonFootprint: Math.max(10, 50 - (avgHealth / 5)),
      timestamp: now
    };
    
    this.lastUpdate = now;
  }

  private calculateBiodiversityIndex(typeCounts: Map<Vessel['type'], number>): number {
    const total = Array.from(typeCounts.values()).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    
    let index = 0;
    for (const count of typeCounts.values()) {
      const proportion = count / total;
      if (proportion > 0) {
        index -= proportion * Math.log(proportion);
      }
    }
    return index / Math.log(typeCounts.size || 1);
  }

  public getBiosphereState(): { vessels: Vessel[]; metrics: SustainabilityMetrics } {
    this.simulateInteractions();
    this.updateMetrics();
    
    return {
      vessels: Array.from(this.vessels.values()),
      metrics: this.metrics
    };
  }

  public getResourceFlows(): ResourceFlow[] {
    return this.flows.slice(-50);
  }

  public getSustainabilityMetrics(): SustainabilityMetrics {
    this.updateMetrics();
    return this.metrics;
  }
}

const biosphere = new FleetBiosphere();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function fleetFooter(): string {
  return `
    <footer style="
      position: fixed;
      bottom: 0;
      width: 100%;
      background: #0a0a0f;
      color: #22c55e;
      text-align: center;
      padding: 1rem;
      font-family: monospace;
      border-top: 1px solid #22c55e;
      z-index: 1000;
    ">
      Fleet Biosphere Ecosystem Simulation | ${new Date().toUTCString()}
    </footer>
  `;
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (path === "/health") {
    return new Response(JSON.stringify({ status: "healthy", timestamp: Date.now() }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  if (path === "/api/biosphere") {
    const state = biosphere.getBiosphereState();
    return new Response(JSON.stringify(state), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  if (path === "/api/flows") {
    const flows = biosphere.getResourceFlows();
    return new Response(JSON.stringify(flows), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  if (path === "/api/sustainability") {
    const metrics = biosphere.getSustainabilityMetrics();
    return new Response(JSON.stringify(metrics), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  if (path === "/") {
    const html = `
      <!DOCTYPE html>
      <html lang="en" style="background: #0a0a0f; color: #fff; height: 100%;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fleet Biosphere</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            background: #0a0a0f; 
            color: #fff;
            min-height: 100vh;
            padding-bottom: 80px;
          }
          .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
          .hero { 
            text-align: center; 
            padding: 3rem 0; 
            border-bottom: 2px solid #22c55e;
            margin-bottom: 2rem;
          }
          h1 { 
            color: #22c55e; 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
          }
          .subtitle { 
            color: #8b8b9c; 
            font-size: 1.2rem; 
            margin-bottom: 2rem;
          }
          .endpoints { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 1.5rem; 
            margin: 2rem 0; 
          }
          .endpoint-card { 
            background: rgba(20, 20, 30, 0.8); 
            border: 1px solid #22c55e; 
            border-radius: 8px; 
            padding: 1.5rem; 
            transition: transform 0.3s;
          }
          .endpoint-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 5px 20px rgba(34, 197, 94, 0.2);
          }
          .endpoint-title { 
            color: #22c55e; 
            margin-bottom: 0.5rem; 
            font-size: 1.3rem;
          }
          .endpoint-desc { 
            color: #8b8b9c; 
            margin-bottom: 1rem; 
            line-height: 1.5;
          }
          .endpoint-link { 
            color: #22c55e; 
            text-decoration: none; 
            border: 1px solid #22c55e; 
            padding: 0.5rem 1rem; 
            border-radius: 4px; 
            display: inline-block;
            transition: all 0.3s;
          }
          .endpoint-link:hover { 
            background: #22c55e; 
            color: #0a0a0f;
          }
          .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin-top: 2rem;
          }
          .metric { 
            background: rgba(20, 20, 30, 0.8); 
            padding: 1rem; 
            border-radius: 6px; 
            border-left: 4px solid #22c55e;
          }
          .metric-value { 
            font-size: 1.8rem; 
            color: #22c55e; 
            font-weight: bold;
          }
          .metric-label { 
            color: #8b8b9c; 
            font-size: 0.9rem; 
            margin-top: 0.5rem;
          }
          .refresh-btn {
            background: #22c55e;
            color: #0a0a0f;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            font-family: inherit;
            font-weight: bold;
            cursor: pointer;
            margin: 1rem 0;
            transition: opacity 0.3s;
          }
          .refresh-btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <h1>Fleet Biosphere</h1>
            <p class="subtitle">Ecosystem simulation for fleet sustainability analysis</p>
          </div>
          
          <div class="endpoints">
            <div class="endpoint-card">
              <h3 class="endpoint-title">/api/biosphere</h3>
              <p class="endpoint-desc">Get current ecosystem state including all vessels and their interactions</p>
              <a href="/api/biosphere" class="endpoint-link" target="_blank">View Data</a>
            </div>
            
            <div class="endpoint-card">
              <h3 class="endpoint-title">/api/flows</h3>
              <p class="endpoint-desc">Monitor resource flows between vessels in the ecosystem</p>
              <a href="/api/flows" class="endpoint-link" target="_blank">View Data</a>
            </div>
            
            <div class="endpoint-card">
              <h3 class="endpoint-title">/api/sustainability</h3>
              <p class="endpoint-desc">Access comprehensive sustainability metrics and carrying capacity</p>
              <a href="/api/sustainability" class="endpoint-link" target="_blank">View Data</a>
            </div>
          </div>
          
          <div id="live-metrics">
            <h2 style="color: #22c55e; margin: 2rem 0 1rem 0;">Live Sustainability Metrics</h2>
            <button class="refresh-btn" onclick="loadMetrics()">Refresh Metrics</button>
            <div class="metrics-grid" id="metrics-container">
              <!-- Metrics loaded dynamically -->
            </div>
          </div>
        </div>
        
        ${fleetFooter()}
        
        <script>
          async function loadMetrics() {
            try {
              const response = await fetch('/api/sustainability');
              const data = await response.json();
              
              const container = document.getElementById('metrics-container');
              container.innerHTML = \`
                <div class="metric">
                  <div class="metric-value">\${data.fleetHealth}%</div>
                  <div class="metric-label">Fleet Health</div>
                </div>
                <div class="metric">
                  <div class="metric-value">\${data.resourceBalance}</div>
                  <div class="metric-label">Resource Balance</div>
                </div>
                <div class="metric">
                  <div class="metric-value">\${data.carryingCapacity}</div>
                  <div class="metric-label">Carrying Capacity</div>
                </div>
                <div class="metric">
                  <div class="metric-value">\${data.biodiversityIndex}</div>
                  <div class="metric-label">Biodiversity Index</div>
                </div>
                <div class="metric">
                  <div class="metric-value">\${data.carbonFootprint}</div>
                  <div class="metric-label">Carbon Footprint</div>
                </div>
              \`;
            } catch (error) {
              console.error('Error loading metrics:', error);
            }
          }
          
          document.addEventListener('DOMContentLoaded', loadMetrics);
          setInterval(loadMetrics, 10000);
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  return new Response("Not Found", { 
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    }
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    return handleRequest(request);
  }
};
