import React, { useState, useEffect } from 'react';
import { Sparkles, HeartPulse, BellRing, Loader2 } from 'lucide-react';

// Mock Data - In a real application, this would come from APIs/databases
const mockTickets = [
  {
    id: 'INC001',
    priority: 'High',
    title: 'Payment Gateway Integration Failure',
    description: 'Customers are unable to complete purchases due to a payment gateway integration failure. Orders are stuck in pending status. Impact: High revenue loss.',
    status: 'Open',
    assignedTo: 'John Doe',
    createdAt: '2025-07-08T10:00:00Z',
    severity: 'Critical',
    affectedService: 'Checkout Service',
  },
  {
    id: 'INC002',
    priority: 'High',
    title: 'User Login Errors on Production',
    description: 'Users are reporting "Invalid Credentials" errors even with correct passwords. Affects a significant portion of the user base. Impact: Customer dissatisfaction, potential loss of active users.',
    status: 'Open',
    assignedTo: 'Jane Smith',
    createdAt: '2025-07-08T11:30:00Z',
    severity: 'High',
    affectedService: 'Authentication Service',
  },
  {
    id: 'INC003',
    priority: 'Medium',
    title: 'Report Generation Timeout',
    description: 'Daily sales reports are timing out during generation. Affects business intelligence dashboards. Impact: Delayed decision-making.',
    status: 'Open',
    assignedTo: 'Team A',
    createdAt: '2025-07-07T15:00:00Z',
    severity: 'Medium',
    affectedService: 'Reporting Service',
  },
];

const mockPastIncidentsKB = [
  {
    id: 'PI001',
    keywords: ['payment gateway', 'integration failure', 'checkout', 'pending orders'],
    summary: 'Past incident where third-party payment gateway API rate limits were exceeded, causing transaction failures. Resolution involved increasing rate limit, implementing retry logic, and monitoring API usage.',
    recommendedActions: [
      'Check payment gateway API logs for specific error codes.',
      'Verify API credentials and network connectivity to the payment gateway.',
      'Review recent code deployments related to payment integration.',
      'Implement circuit breaker pattern for external API calls.',
      'Escalate to payment gateway provider if external issue confirmed.',
    ],
  },
  {
    id: 'PI002',
    keywords: ['login errors', 'authentication', 'invalid credentials', 'user access'],
    summary: 'Previous issue with authentication service due to a recent patch update causing session token invalidation. Resolution involved rolling back the patch and applying a hotfix.',
    recommendedActions: [
      'Check authentication service logs for specific error messages (e.g., token validation failures).',
      'Verify recent deployments or configuration changes to the authentication service.',
      'Inspect database for user account lockouts or corruption.',
      'Consider a phased rollback if a recent deployment is suspected.',
      'Monitor user login success rates in real-time.',
    ],
  },
  {
    id: 'PI03',
    keywords: ['report generation', 'timeout', 'BI', 'dashboard'],
    summary: 'Report generation timeouts were previously caused by large data queries without proper indexing. Resolution involved optimizing database queries and adding necessary indexes.',
    recommendedActions: [
      'Analyze database query performance for the affected reports.',
      'Check database server load and resource utilization.',
      'Review data volume for the reports and consider pagination or aggregation strategies.',
      'Optimize SQL queries and ensure proper indexing.',
    ],
  },
];

const mockProductionInstances = [
  { id: 'Prod-US-East-1', status: 'Healthy', jobs: ['OrderSync', 'InventoryUpdate'], services: ['Frontend', 'Backend', 'Database'], flows: ['Checkout', 'Login'] },
  { id: 'Prod-EU-West-1', status: 'Degraded', jobs: ['OrderSync'], services: ['Frontend', 'Backend'], flows: ['Checkout', 'Login'] },
  { id: 'Prod-Asia-SE-1', status: 'Healthy', jobs: ['OrderSync', 'InventoryUpdate'], services: ['Frontend', 'Backend', 'Database'], flows: ['Checkout', 'Login'] },
];

const mockLogCenterErrors = [
  { id: 'LCE001', instance: 'Prod-US-East-1', type: 'Critical', message: 'Database connection pool exhaustion on Backend Service.', timestamp: '2025-07-08T12:05:00Z' },
  { id: 'LCE002', instance: 'Prod-EU-West-1', type: 'Error', message: 'Failed to process 100+ orders in OrderSync job.', timestamp: '2025-07-08T12:15:00Z' },
  { id: 'LCE003', instance: 'Prod-US-East-1', type: 'Warning', message: 'High CPU utilization on Frontend Service.', timestamp: '2025-07-08T12:20:00Z' },
];

// Header Component
const Header = () => (
  <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl shadow-lg">
    <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
      {/* <Robot className="h-8 w-8" /> AMS AI Assistant */}
      AMS AI Assistant
    </h1>
    <p className="text-center text-purple-100 mt-2">Empowering your RUN Team with intelligent automation</p>
  </header>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
    <span className="ml-3 text-gray-600">AI Agent is thinking...</span>
  </div>
);

// TicketRAG Component
const TicketRAG = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTicketSearch = () => {
    const foundTicket = mockTickets.find(
      (t) => t.id.toLowerCase() === ticketInput.toLowerCase() || t.title.toLowerCase().includes(ticketInput.toLowerCase())
    );
    setSelectedTicket(foundTicket);
    setSimilarIncidents([]);
    setAiRecommendation('');

    if (foundTicket) {
      setLoading(true);
      // Simulate RAG process
      const relevantIncidents = mockPastIncidentsKB.filter((kb) =>
        kb.keywords.some((keyword) => foundTicket.description.toLowerCase().includes(keyword))
      );
      setSimilarIncidents(relevantIncidents);

      // Call Gemini API for recommendation
      generateAIRecommendation(foundTicket, relevantIncidents);
    } else {
      alert('Ticket not found. Please try a different ID or description.');
    }
  };

  const generateAIRecommendation = async (ticket, incidents) => {
    let prompt = `Analyze the following high-priority AMS ticket and provide recommended actions, considering the context of past similar incidents.

Current High-Priority Ticket:
ID: ${ticket.id}
Title: ${ticket.title}
Description: ${ticket.description}
Severity: ${ticket.severity}
Affected Service: ${ticket.affectedService}
Status: ${ticket.status}

Past Similar Incidents (for context):
`;

    if (incidents.length > 0) {
      incidents.forEach((inc, index) => {
        prompt += `\nIncident ${index + 1} (ID: ${inc.id}):
Summary: ${inc.summary}
Past Recommended Actions: ${inc.recommendedActions.join('; ')}
`;
      });
    } else {
      prompt += `\nNo directly similar past incidents found in the knowledge base.`;
    }

    prompt += `\n\nBased on this information, provide a concise list of recommended immediate actions and a brief explanation for each. Also, suggest any potential long-term solutions or preventive measures.`;

    try {
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        setAiRecommendation(result.candidates[0].content.parts[0].text);
      } else {
        setAiRecommendation('Failed to generate AI recommendation. Please try again.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setAiRecommendation('Error generating AI recommendation. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-yellow-500" /> High-Priority Ticket Analysis (RAG)
      </h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter Ticket ID or keywords (e.g., INC001, payment gateway)"
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-300 shadow-md"
          onClick={handleTicketSearch}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Ticket'}
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {selectedTicket && !loading && (
        <div className="mt-6 p-4 border border-indigo-200 bg-indigo-50 rounded-md">
          <h3 className="text-xl font-medium text-indigo-800 mb-3">Ticket Details: {selectedTicket.id}</h3>
          <p><strong>Title:</strong> {selectedTicket.title}</p>
          <p><strong>Description:</strong> {selectedTicket.description}</p>
          <p><strong>Priority:</strong> <span className={`font-semibold ${selectedTicket.priority === 'High' || selectedTicket.priority === 'Critical' ? 'text-red-600' : 'text-orange-600'}`}>{selectedTicket.priority}</span></p>
          <p><strong>Severity:</strong> {selectedTicket.severity}</p>
          <p><strong>Affected Service:</strong> {selectedTicket.affectedService}</p>
          <p><strong>Status:</strong> {selectedTicket.status}</p>

          {similarIncidents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-indigo-700 mb-2">Similar Past Incidents Found:</h4>
              {similarIncidents.map((inc) => (
                <div key={inc.id} className="mb-3 p-3 bg-indigo-100 rounded-md border border-indigo-200">
                  <p><strong>ID:</strong> {inc.id}</p>
                  <p><strong>Summary:</strong> {inc.summary}</p>
                  <p><strong>Past Recommended Actions:</strong> {inc.recommendedActions.join('; ')}</p>
                </div>
              ))}
            </div>
          )}

          {aiRecommendation && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-lg font-medium text-green-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" /> AI Agent's Recommended Actions:
              </h4>
              <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: aiRecommendation.replace(/\n/g, '<br/>') }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// HealthCheck Component
const HealthCheck = () => {
  const [healthResults, setHealthResults] = useState([]);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [checking, setChecking] = useState(false);

  const runHealthCheck = () => {
    setChecking(true);
    setHealthResults([]);
    setTicketMessages([]);

    setTimeout(() => { // Simulate API call delay
      const results = mockProductionInstances.map((instance) => {
        let issues = [];
        let ticketNeeded = false;

        if (instance.status === 'Degraded') {
          issues.push('Instance status is Degraded.');
          ticketNeeded = true;
        }
        // Simulate job failures
        if (instance.id === 'Prod-EU-West-1' && instance.jobs.includes('OrderSync')) {
          issues.push('OrderSync job failed on this instance.');
          ticketNeeded = true;
        }
        // Simulate service issues
        if (instance.id === 'Prod-US-East-1' && instance.services.includes('Backend')) {
          if (Math.random() < 0.3) { // 30% chance of backend issue
            issues.push('Backend service experiencing high latency.');
            ticketNeeded = true;
          }
        }

        return {
          instanceId: instance.id,
          status: issues.length > 0 ? 'Issues Found' : 'Healthy',
          issues: issues,
          ticketNeeded: ticketNeeded,
        };
      });
      setHealthResults(results);

      const newTicketMessages = results.filter(r => r.ticketNeeded).map(r =>
        `AI Agent recommends raising a support ticket for ${r.instanceId} due to: ${r.issues.join(', ')}`
      );
      setTicketMessages(newTicketMessages);
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <HeartPulse className="h-6 w-6 text-red-500" /> Production Instance Health Check
      </h2>
      <button
        className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-300 shadow-md"
        onClick={runHealthCheck}
        disabled={checking}
      >
        {checking ? 'Checking...' : 'Run Quick Health Check'}
      </button>

      {checking && <LoadingSpinner />}

      {healthResults.length > 0 && !checking && (
        <div className="mt-6">
          <h3 className="text-xl font-medium text-gray-800 mb-3">Health Check Results:</h3>
          {healthResults.map((result) => (
            <div key={result.instanceId} className={`p-4 rounded-md mb-3 ${result.status === 'Healthy' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p><strong>Instance:</strong> {result.instanceId}</p>
              <p><strong>Overall Status:</strong> <span className={`font-semibold ${result.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>{result.status}</span></p>
              {result.issues.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-700">Issues:</p>
                  <ul className="list-disc list-inside text-red-600">
                    {result.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ticketMessages.length > 0 && !checking && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-xl font-medium text-blue-800 mb-3">Support Ticket Recommendations:</h3>
          <ul className="list-disc list-inside text-blue-700">
            {ticketMessages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

// AlertsReminders Component
const AlertsReminders = () => {
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState([]);

  const handleSetReminder = () => {
    if (reminderText.trim()) {
      setReminders([...reminders, { text: reminderText, timestamp: new Date().toLocaleString() }]);
      setReminderText('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BellRing className="h-6 w-6 text-blue-500" /> Alerts & Reminders
      </h2>

      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Simulated Critical Alerts from Logs:</h3>
        {mockLogCenterErrors.length > 0 ? (
          <ul className="space-y-3">
            {mockLogCenterErrors.map((alert) => (
              <li key={alert.id} className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                <p><strong>Instance:</strong> {alert.instance}</p>
                <p><strong>Type:</strong> <span className="font-semibold text-orange-700">{alert.type}</span></p>
                <p><strong>Message:</strong> {alert.message}</p>
                <p className="text-sm text-gray-500">Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No critical alerts detected at this time.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-medium text-gray-800 mb-3">Set a Custom Reminder:</h3>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., Follow up on INC001 by EOD"
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300 shadow-md"
            onClick={handleSetReminder}
          >
            Set Reminder
          </button>
        </div>
        {reminders.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Your Reminders:</h4>
            <ul className="list-disc list-inside text-gray-600">
              {reminders.map((r, i) => (
                <li key={i}>{r.text} (Set: {r.timestamp})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// AutomatedActions Component
const AutomatedActions = () => {
  const [actionOutput, setActionOutput] = useState('');
  const [actionTitle, setActionTitle] = useState('');

  const handleAction = (type) => {
    setActionOutput('');
    setActionTitle('');

    if (type === 'local_env_setup') {
      setActionTitle('Simulating Local Environment Setup:');
      setActionOutput(`
        **AI Agent Action: Local Environment Setup**

        This action automates the setup of a developer's local environment.

        **Steps:**
        1.  **Check Prerequisites:**
            * Verify Git installation: \`git --version\`
            * Verify Node.js (LTS) installation: \`node -v\`
            * Verify npm/yarn installation: \`npm -v\` or \`yarn -v\`
            * Verify Docker/Docker Desktop installation: \`docker --version\`
        2.  **Clone Repository:**
            * \`git clone <repository_url>\`
            * \`cd <project_directory>\`
        3.  **Install Dependencies:**
            * \`npm install\` or \`yarn install\` (for frontend/backend services)
        4.  **Database Setup (if applicable):**
            * Start Docker containers for database: \`docker-compose up -d database\`
            * Run database migrations: \`npm run db:migrate\`
        5.  **Environment Variables:**
            * Copy \`.env.example\` to \`.env\`: \`cp .env.example .env\`
            * Prompt user for sensitive variables (e.g., API keys, database passwords) and update \`.env\`.
        6.  **Start Services:**
            * \`npm run dev\` (or relevant command to start all local services)
        7.  **Post-Setup Verification:**
            * Run local tests: \`npm test\`
            * Open application in browser: \`http://localhost:<port>\`
            * Confirm all services are running and accessible.

        **Output:**
        \`\`\`
        Checking Git... OK
        Checking Node.js... OK
        Cloning repository 'my-awesome-project'... Done.
        Installing dependencies... Done.
        Starting database container... Done.
        Running database migrations... Done.
        Please update .env with your specific API keys.
        Starting local services...
        Local environment setup complete! Access at http://localhost:3000
        \`\`\`
      `);
    } else if (type === 'new_project_setup') {
      setActionTitle('Simulating New Project Setup:');
      setActionOutput(`
        **AI Agent Action: New Project Setup**

        This action automates the creation of a new project boilerplate.

        **Steps:**
        1.  **Select Project Template:**
            * Prompt user to choose from available templates (e.g., React App, Node.js API, Python Microservice).
        2.  **Create Project Directory:**
            * \`mkdir <new_project_name>\`
            * \`cd <new_project_name>\`
        3.  **Initialize Project (based on template):**
            * For React: \`npx create-react-app .\` (or Vite/Next.js equivalent)
            * For Node.js: \`npm init -y\` and install common packages (Express, dotenv, etc.)
            * For Python: \`python -m venv venv && source venv/bin/activate && pip install flask\` (or FastAPI/Django equivalent)
        4.  **Initialize Git Repository:**
            * \`git init\`
            * Create initial \`.gitignore\` and \`.env.example\` files.
        5.  **Basic Configuration:**
            * Add a default \`README.md\` with project description.
            * Set up basic linting (ESLint, Prettier) and testing frameworks (Jest, Pytest).
        6.  **Containerization (Optional):**
            * Generate basic \`Dockerfile\` and \`docker-compose.yml\`.
        7.  **CI/CD Pipeline Placeholder:**
            * Create a placeholder CI/CD configuration file (\`.github/workflows/main.yml\` or \`.gitlab-ci.yml\`).
        8.  **Initial Commit:**
            * \`git add .\`
            * \`git commit -m "Initial project setup by AI Agent"\`

        **Output:**
        \`\`\`
        Selected template: React App
        Creating project directory 'my-new-react-app'... Done.
        Initializing React app... Done.
        Initializing Git repository... Done.
        Adding basic configurations... Done.
        Generating Dockerfile... Done.
        Creating CI/CD pipeline placeholder... Done.
        Initial commit created.
        New project 'my-new-react-app' successfully set up!
        \`\`\`
      `);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {/* <Robot className="h-6 w-6 text-purple-500" /> Automated Actions (Demonstration) */}
        Automated Actions (Demonstration)
      </h2>
      <p className="text-gray-700 mb-4">
        The AI Agent can automate routine setup tasks. Below, we simulate the steps it would execute.
      </p>
      <div className="flex gap-4 mb-6">
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
          onClick={() => handleAction('local_env_setup')}
        >
          Simulate Local Environment Setup
        </button>
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-300 shadow-md"
          onClick={() => handleAction('new_project_setup')}
        >
          Simulate New Project Setup
        </button>
      </div>

      {actionOutput && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md">
          <h3 className="text-xl font-medium text-gray-800 mb-3">{actionTitle}</h3>
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: actionOutput.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      )}
    </div>
  );
};


// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6 flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <Header />
        <main className="p-8 space-y-8">
          <TicketRAG />
          <HealthCheck />
          <AlertsReminders />
          // <AutomatedActions />
        </main>
      </div>
    </div>
  );
};

export default App;
