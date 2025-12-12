import React from 'react'
import { Navigate } from 'react-router-dom'


export default function ProtectedRoute({ children, roleRequired }){
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
if(!token) return <Navigate to="/auth/login" replace />;
if(roleRequired && role !== roleRequired) return <Navigate to="/auth/login" replace />;
return children;
}