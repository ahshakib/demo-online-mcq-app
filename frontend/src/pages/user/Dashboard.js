import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {user?.username || 'User'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/exams"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Browse Exams</h2>
            <p className="text-gray-600">View and take available exams</p>
          </Link>

          <Link
            to="/results"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">My Results</h2>
            <p className="text-gray-600">View your exam results and progress</p>
          </Link>

          <Link
            to="/subscriptions"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Subscriptions</h2>
            <p className="text-gray-600">Manage your subscriptions</p>
          </Link>

          <Link
            to="/routines"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Exam Routines</h2>
            <p className="text-gray-600">View upcoming exam schedules</p>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">Update your profile information</p>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
              <p className="text-gray-100">Manage system settings</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
