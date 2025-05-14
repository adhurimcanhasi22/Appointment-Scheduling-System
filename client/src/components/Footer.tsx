import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">Bella Salon</h3>
            <p className="text-neutral-400 mt-2">Your beauty journey starts with us. Professional hair, nail, facial and beauty services.</p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services?category=hair" className="text-neutral-400 hover:text-white">
                  Hair Styling
                </Link>
              </li>
              <li>
                <Link href="/services?category=hair" className="text-neutral-400 hover:text-white">
                  Hair Coloring
                </Link>
              </li>
              <li>
                <Link href="/services?category=nails" className="text-neutral-400 hover:text-white">
                  Nail Care
                </Link>
              </li>
              <li>
                <Link href="/services?category=facial" className="text-neutral-400 hover:text-white">
                  Facial Treatments
                </Link>
              </li>
              <li>
                <Link href="/services?category=makeup" className="text-neutral-400 hover:text-white">
                  Makeup Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/book" className="text-neutral-400 hover:text-white">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/staff" className="text-neutral-400 hover:text-white">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact Info</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 flex-shrink-0" />
                <span>123 Beauty Street, Suite 100<br/>New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@bellasalon.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Mon-Sat: 9:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">&copy; {new Date().getFullYear()} Bella Salon. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4 text-sm text-neutral-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
