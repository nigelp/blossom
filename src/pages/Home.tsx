import { Car, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const actions = [
    {
      to: '/create-ride',
      icon: Car,
      title: 'Create a Ride',
      description: 'Offer a ride to others'
    },
    {
      to: '/find-ride',
      icon: Search,
      title: 'Find a Ride',
      description: 'Search for available rides'
    },
    {
      to: '/profile',
      icon: User,
      title: 'My Profile',
      description: 'View and edit your profile'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Car Share</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create or Find a Ride</h3>
              <p className="text-gray-600">Either offer a ride or search for available rides</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Connect</h3>
              <p className="text-gray-600">Get in touch with drivers or passengers</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <span className="text-blue-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Share the Ride</h3>
              <p className="text-gray-600">Meet at the pickup location and enjoy the journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;