import React, { useState, useEffect } from 'react';
import { getCachedImage, cacheImage } from '../services/imageService';

/**
 * A wrapper around <img> that attempts to use/save local cache
 */
const CachedImage = ({ src, alt, className, style }) => {
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        const loadCache = async () => {
            if (!src) return;

            // Try to get from cache
            const cachedUrl = await getCachedImage(src);
            if (cachedUrl !== src) {
                setDisplaySrc(cachedUrl);
            } else {
                // Not in cache, use original and trigger background cache
                setDisplaySrc(src);
                cacheImage(src);
            }
        };

        loadCache();
    }, [src]);

    if (!src) return null;

    return (
        <img
            src={displaySrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setDisplaySrc(src)} // Fallback to original if blob fails
        />
    );
};

export default CachedImage;
