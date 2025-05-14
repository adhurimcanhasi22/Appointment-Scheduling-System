import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Sample gallery images
const galleryImages = {
  salon: [
    { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Salon interior' },
    { src: 'https://images.unsplash.com/photo-1633681926037-84baf5a54836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Reception area' },
    { src: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Styling station' },
    { src: 'https://images.unsplash.com/photo-1562322140-8baeeca582d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Relaxation area' },
  ],
  hair: [
    { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Hair styling' },
    { src: 'https://images.unsplash.com/photo-1562322140-8baeeca582d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Hair coloring' },
    { src: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Haircut' },
    { src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Hair treatment' },
  ],
  nails: [
    { src: 'https://images.unsplash.com/photo-1604654894611-83ad970d9dac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Manicure' },
    { src: 'https://images.unsplash.com/photo-1610992644866-5dfce2dea5b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Nail art' },
    { src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Pedicure' },
    { src: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Gel nails' },
  ],
  makeup: [
    { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Makeup application' },
    { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Bridal makeup' },
    { src: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Evening makeup' },
    { src: 'https://images.unsplash.com/photo-1513262599279-d287e25f4d84?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600', alt: 'Natural makeup' },
  ],
};

export default function Gallery() {
  const [currentCategory, setCurrentCategory] = useState('salon');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-heading text-neutral-800 mb-4">Our Gallery</h1>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          Browse our gallery to see our salon, stylist work, and the beautiful results we create for our clients.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs 
        defaultValue="salon" 
        onValueChange={setCurrentCategory}
        className="mb-8"
      >
        <div className="flex justify-center">
          <TabsList className="mb-8">
            <TabsTrigger value="salon" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Salon
            </TabsTrigger>
            <TabsTrigger value="hair" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Hair
            </TabsTrigger>
            <TabsTrigger value="nails" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Nails
            </TabsTrigger>
            <TabsTrigger value="makeup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Makeup
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages[currentCategory as keyof typeof galleryImages].map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div 
                  className="relative overflow-hidden rounded-lg aspect-square cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300"></div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </Tabs>

      {/* Book Appointment CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold font-heading text-neutral-800 mb-4">Like What You See?</h2>
        <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
          Book an appointment today and let our skilled professionals create a look you'll love.
        </p>
        <Button 
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg"
          onClick={() => window.location.href = '/book'}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}