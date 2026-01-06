import { useState } from 'react';
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
import past16 from '@/assets/past-self/past-16.jpg';
import past17 from '@/assets/past-self/past-17.jpg';
import past18 from '@/assets/past-self/past-18.jpg';
import past19 from '@/assets/past-self/past-19.png';
import past20 from '@/assets/past-self/past-20.jpg';
import past21 from '@/assets/past-self/past-21.jpg';
import past22 from '@/assets/past-self/past-22.jpg';
import past23 from '@/assets/past-self/past-23.jpg';
import past24 from '@/assets/past-self/past-24.jpg';
import past25 from '@/assets/past-self/past-25.jpg';
import past26 from '@/assets/past-self/past-26.jpg';
import past27 from '@/assets/past-self/past-27.jpg';
import past28 from '@/assets/past-self/past-28.jpg';
import past29 from '@/assets/past-self/past-29.jpg';
import past30 from '@/assets/past-self/past-30.jpg';
import past31 from '@/assets/past-self/past-31.png';
import { useUserGalleryMedia, type UserGalleryMedia } from '@/hooks/useUserGalleryMedia';
import { GalleryUploadButton } from '@/components/gallery/GalleryUploadButton';
import { MediaCard } from '@/components/gallery/MediaCard';
import { MediaPlayerModal } from '@/components/gallery/MediaPlayerModal';

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
  { src: past16, alt: 'Past self - moment 16' },
  { src: past17, alt: 'Past self - moment 17' },
  { src: past18, alt: 'Past self - moment 18' },
  { src: past19, alt: 'Past self - moment 19' },
  { src: past20, alt: 'Past self - moment 20' },
  { src: past21, alt: 'Past self - moment 21' },
  { src: past22, alt: 'Past self - moment 22' },
  { src: past23, alt: 'Past self - moment 23' },
  { src: past24, alt: 'Past self - moment 24' },
  { src: past25, alt: 'Past self - moment 25' },
  { src: past26, alt: 'Past self - moment 26' },
  { src: past27, alt: 'Past self - moment 27' },
  { src: past28, alt: 'Past self - moment 28' },
  { src: past29, alt: 'Past self - moment 29' },
  { src: past30, alt: 'Past self - moment 30' },
  { src: past31, alt: 'Past self - moment 31' },
];

export function PastSelfGallery() {
  const { media: userMedia, isUploading, uploadMedia } = useUserGalleryMedia('past');
  const [selectedMedia, setSelectedMedia] = useState<UserGalleryMedia | null>(null);
  const [selectedSystemImage, setSelectedSystemImage] = useState<string | null>(null);
  
  const totalSystemImages = PAST_SELF_IMAGES.length;
  const totalItems = totalSystemImages + userMedia.length;

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
        {/* System images */}
        {PAST_SELF_IMAGES.map((image, index) => (
          <div 
            key={`system-${index}`}
            className="relative aspect-square overflow-hidden rounded bg-muted border border-border group cursor-pointer"
            onClick={() => setSelectedSystemImage(image.src)}
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

        {/* User uploaded media */}
        {userMedia.map((item, index) => (
          <MediaCard
            key={item.id}
            url={item.url}
            type={item.type}
            index={totalSystemImages + index}
            onClick={() => setSelectedMedia(item)}
            variant="past"
          />
        ))}

        {/* Upload button at the end */}
        <GalleryUploadButton
          section="reality"
          isUploading={isUploading}
          onUpload={uploadMedia}
          mediaIndex={totalItems}
        />
      </div>

      {/* Media player modal for user media */}
      {selectedMedia && (
        <MediaPlayerModal
          url={selectedMedia.url}
          type={selectedMedia.type}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Image modal for system images */}
      {selectedSystemImage && (
        <MediaPlayerModal
          url={selectedSystemImage}
          type="image"
          onClose={() => setSelectedSystemImage(null)}
        />
      )}
    </section>
  );
}
