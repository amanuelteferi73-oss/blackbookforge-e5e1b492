import past1 from '@/assets/past-self/past-1.jpg';
import past2 from '@/assets/past-self/past-2.jpg';
import past3 from '@/assets/past-self/past-3.jpg';
import past4 from '@/assets/past-self/past-4.jpg';
import past5 from '@/assets/past-self/past-5.jpg';
import past6 from '@/assets/past-self/past-6.jpg';
import past7 from '@/assets/past-self/past-7.jpg';
import past8 from '@/assets/past-self/past-8.png';
import past9 from '@/assets/past-self/past-9.jpg';
import past10 from '@/assets/past-self/past-10.jpg';
import past11 from '@/assets/past-self/past-11.png';
import past12 from '@/assets/past-self/past-12.png';
import past13 from '@/assets/past-self/past-13.png';
import past14 from '@/assets/past-self/past-14.png';
import past15 from '@/assets/past-self/past-15.png';

const PAST_SELF_IMAGES = [
  { src: past1, alt: 'Past self - moment 1' },
  { src: past2, alt: 'Past self - moment 2' },
  { src: past3, alt: 'Past self - moment 3' },
  { src: past4, alt: 'Past self - moment 4' },
  { src: past5, alt: 'Past self - moment 5' },
  { src: past6, alt: 'Past self - moment 6' },
  { src: past7, alt: 'Past self - moment 7' },
  { src: past8, alt: 'Past self - moment 8' },
  { src: past9, alt: 'Past self - moment 9' },
  { src: past10, alt: 'Past self - moment 10' },
  { src: past11, alt: 'Past self - moment 11' },
  { src: past12, alt: 'Past self - moment 12' },
  { src: past13, alt: 'Past self - moment 13' },
  { src: past14, alt: 'Past self - moment 14' },
  { src: past15, alt: 'Past self - moment 15' },
];

export function PastSelfGallery() {
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          REALITY STATE
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Where you came from. Never deletable. Always visible.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PAST_SELF_IMAGES.map((image, index) => (
          <div 
            key={index}
            className="relative aspect-square overflow-hidden rounded bg-muted border border-border group"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
            <div className="absolute bottom-2 left-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                #{(index + 1).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
