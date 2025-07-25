import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../Layout';
import { DataTable } from '../DataTable';
import type { Database } from '../../lib/supabase';
import { CheckSquare, Calendar, User, AlertTriangle, Clock } from 'lucide-react';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskWithProfiles = Task & {
  assigned_to_profile?: { full_name: string } | null;
  assigned_by_profile?: { full_name: string } | null;
};

export const TasksView: React.FC = () => {
  const { user } = useAuth();
  const { tasks } = useData();

  const canView = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';

  if (!canView) {
    return (
      <Layout title="Tasks">
        <div className="text-center py-12">
          <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view tasks.
          </p>
        </div>
      </Layout>
    );
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (value: string, row: TaskWithProfiles) => (
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{value}</span>
            {isOverdue(row.due_date, row.status) && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          {row.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{row.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'assigned_to_profile',
      label: 'Assigned To',
      render: (value: any, row: TaskWithProfiles) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.assigned_to_profile?.full_name || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: string) => getPriorityBadge(value)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value: string, row: TaskWithProfiles) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={isOverdue(value, row.status) ? 'text-red-600 font-medium' : ''}>
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      key: 'assigned_by_profile',
      label: 'Assigned By',
      render: (value: any, row: TaskWithProfiles) => (
        <span className="text-sm text-gray-600">
          {row.assigned_by_profile?.full_name || 'System'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => isOverdue(t.due_date, t.status));

  // Filter tasks based on user role
  const filteredTasks = user?.role === 'staff' 
    ? tasks.filter(t => t.assigned_to === user.id)
    : tasks;

  return (
    <Layout title="Task Management">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">{pendingTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-semibold">{inProgressTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">{completedTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-semibold">{overdueTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Overdue Tasks</h3>
            </div>
            <p className="text-red-700 text-sm mb-3">
              The following tasks are past their due date:
            </p>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map(task => (
                <div key={task.id} className="bg-white p-2 rounded border flex items-center justify-between">
                  <div>
                    <span className="font-medium">{task.title}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Due: {new Date(task.due_date).toLocaleDateString()})
                    </span>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              ))}
            </div>
            {overdueTasks.length > 5 && (
              <p className="text-red-600 text-sm mt-2">
                +{overdueTasks.length - 5} more overdue tasks
              </p>
            )}
          </div>
        )}

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['urgent', 'high', 'medium', 'low'].map(priority => {
              const count = tasks.filter(t => t.priority === priority).length;
              const percentage = tasks.length > 0 ? ((count / tasks.length) * 100).toFixed(1) : '0';
              return (
                <div key={priority} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{priority}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks Table */}
        <DataTable
          title={user?.role === 'staff' ? 'My Tasks' : 'All Tasks'}
          data={filteredTasks}
          columns={columns}
          searchable={true}
        />
      </div>
    </Layout>
  );
};