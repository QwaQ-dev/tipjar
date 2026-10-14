import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Tip from './pages/Tip'

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/tip/:username" element={<Tip />} /><Route path="*" element={<Home />} /></Routes>
}
