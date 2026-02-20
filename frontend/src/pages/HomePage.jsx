import { useRef } from 'react'
import HeroSection from '../components/HeroSection'

export default function HomePage({ songs, onPlay, onToggleFavorite }) {
    const carouselRef = useRef(null)

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })
        }
    }

    return (
        <div className="relative min-h-screen pb-20">
            <HeroSection
                songs={songs}
                onPlay={onPlay}
                onToggleFavorite={onToggleFavorite}
                carouselRef={carouselRef}
                onScrollLeft={scrollLeft}
                onScrollRight={scrollRight}
            />
        </div>
    )
}
