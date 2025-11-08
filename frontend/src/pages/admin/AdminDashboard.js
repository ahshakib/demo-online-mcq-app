import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const adminLinks = [
    { to: '/admin/subjects', title: 'Subjects', description: 'Manage subjects' },
    { to: '/admin/chapters', title: 'Chapters', description: 'Manage chapters' },
    { to: '/admin/exams', title: 'Exams', description: 'Manage exams' },
    { to: '/admin/questions', title: 'Questions', description: 'Manage questions' },
    { to: '/admin/routines', title: 'Routines', description: 'Manage exam routines' },
    { to: '/admin/results', title: 'Results', description: 'View all results' },
    { to: '/admin/subscriptions', title: 'Subscriptions', description: 'Manage subscriptions' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{link.title}</h2>
              <p className="text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
