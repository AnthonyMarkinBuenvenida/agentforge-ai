import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AgentDetailPage from './pages/AgentDetailPage'
import AgentFormPage from './pages/AgentFormPage'
import AgentsPage from './pages/AgentsPage'
import DashboardPage from './pages/DashboardPage'
import RunDetailPage from './pages/RunDetailPage'
import RunsPage from './pages/RunsPage'
import WorkflowDetailPage from './pages/WorkflowDetailPage'
import WorkflowFormPage from './pages/WorkflowFormPage'
import WorkflowsPage from './pages/WorkflowsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/new" element={<AgentFormPage />} />
          <Route path="agents/:id" element={<AgentDetailPage />} />
          <Route path="agents/:id/edit" element={<AgentFormPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="workflows/new" element={<WorkflowFormPage />} />
          <Route path="workflows/:id" element={<WorkflowDetailPage />} />
          <Route path="workflows/:id/edit" element={<WorkflowFormPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="runs/:id" element={<RunDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
