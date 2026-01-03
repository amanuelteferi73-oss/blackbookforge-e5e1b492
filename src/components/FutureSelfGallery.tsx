import { useState } from 'react';
import future1 from '@/assets/future-self/future-1.jpg';
import future2 from '@/assets/future-self/future-2.jpg';
import future3 from '@/assets/future-self/future-3.jpg';
import future4 from '@/assets/future-self/future-4.jpg';
import future5 from '@/assets/future-self/future-5.jpg';
import future6 from '@/assets/future-self/future-6.jpg';
import future7 from '@/assets/future-self/future-7.jpg';
import future8 from '@/assets/future-self/future-8.jpg';
import future9 from '@/assets/future-self/future-9.jpg';
import future10 from '@/assets/future-self/future-10.jpg';

const FUTURE_SELF_IMAGES = [
  { src: future1, alt: 'Future self - moment 1', caption: 'Emmanuel sitting in his Tesla Model X' },
  { src: future2, alt: 'Future self - moment 2', caption: 'Emmanuel with his Cybertruck - This is where we belong' },
  { src: future3, alt: 'Future self - moment 3', caption: 'Emmanuel in front of his dream home' },
  { src: future4, alt: 'Future self - moment 4', caption: 'Emmanuel learning from industry leaders - Build Once, Scale Forever' },
  { src: future5, alt: 'Future self - moment 5', caption: 'Emmanuel with Elon Musk - The Future Is Built' },
  { src: future6, alt: 'Future self - moment 6', caption: 'Emmanuel with Max Verstappen - Simply Lovely' },
  { src: future7, alt: 'Future self - moment 7', caption: 'Emmanuel exploring the world' },
  { src: future8, alt: 'Future self - moment 8', caption: 'Emmanuel - No Excuses. Different fields. Same standard.' },
  { src: future9, alt: 'Future self - moment 9', caption: 'Emmanuel\'s peaceful retreat in the forest' },
  { src: future10, alt: 'Future self - moment 10', caption: 'Emmanuel with his Cybertruck - Standing firm' },
];

export function FutureSelfGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight uppercase">
          Vision State
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Where you are going. The future you are building.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FUTURE_SELF_IMAGES.map((image, index) => (
          <div 
            key={index}
            className="relative aspect-square overflow-hidden rounded bg-muted border border-border group cursor-pointer"
            onClick={() => setSelectedImage(selectedImage === index ? null : index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-70" />
            
            {/* Number badge */}
            <div className="absolute bottom-2 left-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                #{(index + 1).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Caption overlay when clicked */}
            {selectedImage === index && (
              <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 animate-fade-in">
                <p className="text-sm text-center text-foreground font-medium leading-relaxed">
                  {image.caption}
                </p>
              </div>
            )}
            
            {/* Subtle future indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[9px] text-primary/80 uppercase tracking-wider">
                soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
