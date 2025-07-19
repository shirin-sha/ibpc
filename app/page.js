'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FormInput from '../components/FormInput';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: ''
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    res.ok ? toast.success('Inquiry submitted!') : toast.error('Error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-slate-900">
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Logo + Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            {/* Replace with actual image path if needed */}
            <img src="/logo.png" alt="IBPC Logo" className="w-22 h-22" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Membership Inquiry</h2>
          <p className="text-sm text-gray-600">Submit your details to get started</p>
        </div>

        {/* Form Inputs */}
        <FormInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <FormInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormInput
          label="Business Info"
          name="business"
          value={formData.business}
          onChange={handleChange}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#404040] text-white py-2.5 px-4 rounded-lg hover:bg-[#303030] transition-colors duration-200 font-medium mt-4"
        >
          Submit
        </button>
      </motion.form>
    </div>
  );
}
