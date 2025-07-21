
"use client";
import React, { useState } from 'react';
// import { Button, TextField, Box, Typography, Container, Alert } from '@mui/material';
import Clients from '../clients/page';
import { encryptData } from '@/utils/crypto';

const Login = () => {
  // const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically make an API call to authenticate
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.data.token);
        if(data.status == "success"){          
          localStorage.setItem('AUTH_TOKEN_KEY', data.data.token);
          localStorage.setItem('token', data.data.token);
          console.log(data.data.user.role);
          if(data.data.user.role != "admin"){
            console.log(data.data.user.role);
            
            const encryptedToken = await encryptData(data.data.token); 
            const safeToken = encodeURIComponent(encryptedToken);// Base64 encode the token = btoa(data.data.token); // Base64 encode the token
            // window.location.href = `https://partner-master.vercel.app?token=${safeToken}`;
            window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}?token=${safeToken}`;
          }else{

            window.location.href = '/dashboard';
          }
        }
        
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
  <div>
<form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow-md">
  <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
  
  {error && (
    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {error}
    </div>
  )}

  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
      Email
    </label>
    <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
      required
    />
  </div>

  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
      Password
    </label>
    <input
      type="password"
      id="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
      required
    />
  </div>

  <button
    type="submit"
    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
  >
    Sign In
  </button>
</form>
  </div>
  );
};

export default Login;
