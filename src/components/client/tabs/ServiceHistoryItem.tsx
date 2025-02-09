import { Service, MediaUploadResult } from '../../../types/service';
import { StarIcon } from '@heroicons/react/24/solid';

interface ServiceHistoryItemProps {
  service: Service;
  onAddMedia: () => void;
}

export default function ServiceHistoryItem({ service, onAddMedia }: ServiceHistoryItemProps) {
  return (
    <div className="p-4 mb-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{service.service}</h3>
          <p className="text-sm text-gray-500">{service.provider}</p>
          <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString()}</p>
          {service.rating && (
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < service.rating! ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onAddMedia}
          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Add Media
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <h4 className="text-sm font-medium mb-1">Before</h4>
          <img
            src={service.beforeImage}
            alt="Before service"
            className="rounded-lg w-full h-auto max-w-[200px]"
          />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">After</h4>
          <img
            src={service.afterImage}
            alt="After service"
            className="rounded-lg w-full h-auto max-w-[200px]"
          />
        </div>
      </div>

      {service.media && service.media.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Additional Media</h4>
          <div className="grid grid-cols-3 gap-2">
            {service.media.map((media: MediaUploadResult, index: number) => (
              <div key={index}>
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.caption || 'Service media'}
                    className="rounded-lg w-full h-auto max-w-[150px]"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="rounded-lg"
                  />
                )}
                {media.caption && (
                  <p className="text-xs text-gray-600 mt-1">{media.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
