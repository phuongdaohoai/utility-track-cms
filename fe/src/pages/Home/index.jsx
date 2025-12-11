/**
 * Home Page
 * Landing page
 */
import Button from '../../components/Button';

export const HomePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to Utility Track CMS</h1>
      <p className="text-lg text-gray-600">
        Manage your utilities efficiently with our comprehensive CMS platform.
      </p>
      <div className="flex gap-4">
        <Button variant="primary" size="lg">Get Started 1</Button>
        <Button variant="secondary" size="lg">Learn More</Button>
      </div>
    </div>
  );
};

export default HomePage;
