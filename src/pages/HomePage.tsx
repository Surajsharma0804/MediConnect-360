import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Video, Brain, Stethoscope, BarChart, Heart, Shield, Users } from 'lucide-react';
import FeatureCard from '../components/home/FeatureCard';
import HeroSection from '../components/home/HeroSection';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const features = [
    {
      title: "AI Symptom Checker",
      description: "Advanced AI analyzes your symptoms and provides initial assessment with health insights.",
      icon: <Brain className="h-6 w-6 text-indigo-600" />,
      link: "/symptom-checker",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Virtual Consultations",
      description: "Connect with healthcare providers through secure, high-quality video appointments.",
      icon: <Video className="h-6 w-6 text-blue-600" />,
      link: "/virtual-consult",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Health Dashboard",
      description: "Monitor your health metrics, track progress, and visualize your health journey.",
      icon: <BarChart className="h-6 w-6 text-emerald-600" />,
      link: "/dashboard",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Medical Specialists",
      description: "Access a network of verified specialists across multiple medical disciplines.",
      icon: <Stethoscope className="h-6 w-6 text-cyan-600" />,
      link: "/specialists",
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Secure Health Records",
      description: "Your medical data is protected with end-to-end encryption and accessible only to authorized providers.",
      icon: <Shield className="h-6 w-6 text-emerald-600" />,
      link: "/security",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Community Support",
      description: "Join condition-specific groups for peer support and shared experiences.",
      icon: <Users className="h-6 w-6 text-amber-600" />,
      link: "/community",
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Emergency SOS Button */}
      <div className="relative">
        <div className="absolute top-0 right-4 md:right-8 -mt-6 md:-mt-8 z-20">
          <Link 
            to="/emergency"
            className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <Heart className="h-5 w-5 mr-2" fill="white" />
            Emergency SOS
          </Link>
        </div>
      </div>
      
      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 glass-panel mt-4 mx-4 sm:mx-8 lg:mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              2,500+
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Active Healthcare Providers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              1M+
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Patients Served</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              98%
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Patient Satisfaction</p>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Comprehensive Healthcare Services
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover how MediConnect 360 is revolutionizing healthcare with technology and compassionate care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              link={feature.link}
              color={feature.color}
              requiresAuth={isAuthenticated ? false : true}
            />
          ))}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 glass-panel mx-4 sm:mx-8 lg:mx-auto max-w-7xl my-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of patients and providers who are already experiencing modern healthcare with MediConnect 360.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
            )}
            <Link
              to="/how-it-works"
              className="btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                <Activity size={24} />
                MediConnect 360
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Modern healthcare through innovative technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Services</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/symptom-checker" className="hover:text-blue-600 dark:hover:text-blue-400">AI Symptom Checker</Link></li>
                <li><Link to="/virtual-consult" className="hover:text-blue-600 dark:hover:text-blue-400">Virtual Consultations</Link></li>
                <li><Link to="/specialists" className="hover:text-blue-600 dark:hover:text-blue-400">Specialist Network</Link></li>
                <li><Link to="/emergency" className="hover:text-blue-600 dark:hover:text-blue-400">Emergency Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-blue-600 dark:hover:text-blue-400">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/hipaa" className="hover:text-blue-600 dark:hover:text-blue-400">HIPAA Compliance</Link></li>
                <li><Link to="/accessibility" className="hover:text-blue-600 dark:hover:text-blue-400">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} MediConnect 360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
