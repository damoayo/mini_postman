'use client';

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // 전체 사용자 조회
  const fetchUsers = async () => {
    const response = await fetch('http://localhost:8080/api/users');
    const data = await response.json();
    setUsers(data);
  };

  // 사용자 생성
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      setName('');
      setEmail('');
      fetchUsers(); // 목록 새로고침
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      {/* 사용자 생성 폼 */}
      <form onSubmit={createUser} className="mb-8 space-y-4">
        <div>
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
      </form>

      {/* 사용자 목록 */}
      <button
        onClick={fetchUsers}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Load Users
      </button>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
