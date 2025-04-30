"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Clock, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
    
    // Set animation trigger after a small delay
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Add scroll animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, { threshold: 0.1 });
    
    // Observe elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      // Cleanup observer
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Reduce Food Waste",
      description: "Connect surplus food with those who need it most, ensuring no food goes to waste."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Quick Pickup",
      description: "Arrange for quick and efficient pickups, preserving food quality and freshness."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Support Communities",
      description: "Help feed families in need and strengthen community bonds through giving."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Track Impact",
      description: "Monitor your contributions and see the real-world impact of your donations."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Meals Donated" },
    { value: "500+", label: "Active Donors" },
    { value: "50+", label: "NGO Partners" },
    { value: "100+", label: "Communities Served" }
  ];

  const testimonials = [
    {
      quote: "Surplus2Share has revolutionized how we distribute food to those in need. The platform is intuitive and has helped us reach more families than ever before.",
      author: "Maria Rodriguez",
      role: "Food Bank Director"
    },
    {
      quote: "As a restaurant owner, I was always troubled by the amount of food we had to throw away. Now, I can donate it to people who need it most - it's a win-win!",
      author: "James Chen",
      role: "Restaurant Owner"
    }
  ];

  return (
    <main className="flex flex-col items-center">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .hero-content {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .hero-content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hero-image {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          transition-delay: 0.3s;
        }
        
        .hero-image.is-visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        
        .animate-fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className={`lg:w-1/2 space-y-6 hero-content ${isVisible ? 'is-visible' : ''}`}>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Share Your <span className="text-primary">Surplus</span>, <br />
                Nourish <span className="text-primary">Communities</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl">
                Connect surplus food with NGOs who distribute to those in need.
                Join our mission to reduce food waste and fight hunger, one meal at a time.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && !isLoading ? (
                  <Link href="/login">
                    <Button size="lg" className="px-8 py-6 text-lg font-medium">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    {userData?.role === "DONOR" ? (
                      <Link href="/donor/dashboard">
                        <Button size="lg" className="px-8 py-6 text-lg font-medium">
                          My Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/receiver/dashboard">
                        <Button size="lg" className="px-8 py-6 text-lg font-medium">
                          My Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-medium">
                    Explore Donations
                  </Button>
                </Link>
              </div>
            </div>
            <div className={`lg:w-1/2 relative h-80 sm:h-96 lg:h-[500px] w-full rounded-xl overflow-hidden shadow-2xl hero-image ${isVisible ? 'is-visible' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10 rounded-xl" />
              <Image 
                src="/images/hero-food-donation.jpg" 
                alt="Food donation volunteers sorting donations"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                className="rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to donate surplus food and help those in need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">List Your Surplus</h3>
              <p className="text-gray-600">Easily list your surplus food items, including quantity, type, and expiration date.</p>
            </div>
            
            <div className="flex flex-col items-center text-center animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with NGOs</h3>
              <p className="text-gray-600">NGOs can browse and request your donations based on their current needs.</p>
            </div>
            
            <div className="flex flex-col items-center text-center animate-on-scroll" style={{ transitionDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete the Donation</h3>
              <p className="text-gray-600">Arrange pickup or delivery and track your donation's impact on communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Surplus2Share</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're making food donation simple, efficient, and impactful
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-md feature-card animate-on-scroll" 
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="w-full py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Together, we're making a difference in communities across the nation
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-on-scroll" style={{ transitionDelay: `${index * 0.15}s` }}>
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our community of donors and NGOs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl animate-on-scroll" style={{ transitionDelay: `${index * 0.15}s` }}>
                <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">{testimonial.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10">
            Join our growing community of donors and NGOs who are fighting food waste and hunger together.
          </p>
          
          {!isAuthenticated && !isLoading ? (
            <Link href="/login">
              <Button size="lg" variant="secondary" className="px-10 py-6 text-lg font-medium">
                Get Started Today
              </Button>
            </Link>
          ) : (
            <>
              {userData?.role === "DONOR" ? (
                <Link href="/donor/dashboard">
                  <Button size="lg" variant="secondary" className="px-10 py-6 text-lg font-medium">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/receiver/dashboard">
                  <Button size="lg" variant="secondary" className="px-10 py-6 text-lg font-medium">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </section>

      {/* Partners/NGOs Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our NGO Partners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Working together to distribute food to those who need it most
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center h-32 bg-gray-100 rounded-lg animate-on-scroll" style={{ transitionDelay: `${index * 0.15}s` }}>
                <div className="text-gray-400 font-semibold">NGO Partner Logo</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Surplus2Share</h3>
              <p className="text-gray-400">
                Connecting surplus food with those who need it most, one meal at a time.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/explore" className="text-gray-400 hover:text-primary transition-colors">Explore Donations</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-400 hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/faqs" className="text-gray-400 hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Stay Connected</h4>
              <p className="text-gray-400">Follow us on social media for updates and stories of impact.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Surplus2Share. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
