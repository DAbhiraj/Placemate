import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Readable } from "stream";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer|string} fileBuffer - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with url and public_id
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'placemate/resumes',
      resource_type: 'auto',
      format: 'pdf',
      ...options
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              created_at: result.created_at
            });
          }
        }
      );

      // If fileBuffer is a Buffer, pipe it to the upload stream
      if (Buffer.isBuffer(fileBuffer)) {
        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      } else {
        // If fileBuffer is a file path string, use cloudinary's direct upload
        cloudinary.uploader.upload(fileBuffer, defaultOptions)
          .then(resolve)
          .catch(reject);
      }
    });
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the file
 * @returns {Promise<Object>} Delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get file URL from Cloudinary public_id
 * @param {string} publicId - Cloudinary public_id
 * @returns {string} Cloudinary URL
 */
export const getCloudinaryUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true
  });
};

export default cloudinary;
