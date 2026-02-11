import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DemoPage from './pages/DemoPage';
import DocsPage from './pages/DocsPage';

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <Layout>
                <Routes>
                    <Route path="/" element={<DemoPage />} />
                    <Route path="/docs" element={<DocsPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
